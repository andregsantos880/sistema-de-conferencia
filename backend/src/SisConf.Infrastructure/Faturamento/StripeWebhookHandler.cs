using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;
using SisConf.Domain.Faturamento;
using SisConf.Domain.Tenants;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Infrastructure.Faturamento;

/// <summary>
/// Processa eventos do webhook Stripe. Idempotência via stripe_evento.stripe_event_id UNIQUE.
/// </summary>
public class StripeWebhookHandler
{
    private readonly SisConfDbContext _db;
    private readonly StripeOptions _opts;
    private readonly ILogger<StripeWebhookHandler> _log;

    public StripeWebhookHandler(SisConfDbContext db, IOptions<StripeOptions> opts, ILogger<StripeWebhookHandler> log)
    {
        _db = db;
        _opts = opts.Value;
        _log = log;
    }

    public Event? ValidarAssinatura(string corpo, string assinaturaHeader)
    {
        if (string.IsNullOrEmpty(_opts.WebhookSecret))
        {
            _log.LogWarning("Webhook recebido mas WebhookSecret não configurado.");
            return null;
        }
        try
        {
            return EventUtility.ConstructEvent(corpo, assinaturaHeader, _opts.WebhookSecret);
        }
        catch (StripeException ex)
        {
            _log.LogWarning(ex, "Falha na validação do webhook Stripe.");
            return null;
        }
    }

    public async Task ProcessarAsync(Event ev, CancellationToken ct)
    {
        // Idempotência: já vimos esse stripe_event_id?
        var jaProcessado = await _db.StripeEventos.IgnoreQueryFilters()
            .AnyAsync(e => e.StripeEventId == ev.Id, ct);
        if (jaProcessado)
        {
            _log.LogInformation("Stripe event {Id} já processado, ignorando.", ev.Id);
            return;
        }

        var registro = StripeEvento.Criar(ev.Type, ev.Id, JsonSerializer.Serialize(ev));
        _db.StripeEventos.Add(registro);
        await _db.SaveChangesAsync(ct);

        try
        {
            switch (ev.Type)
            {
                case "customer.subscription.created":
                case "customer.subscription.updated":
                    await OnSubscriptionAlteradaAsync(ev, ct);
                    break;
                case "customer.subscription.deleted":
                    await OnSubscriptionCanceladaAsync(ev, ct);
                    break;
                case "invoice.created":
                case "invoice.finalized":
                    await OnFaturaAlteradaAsync(ev, FaturaStatus.Aberta, ct);
                    break;
                case "invoice.paid":
                    await OnFaturaAlteradaAsync(ev, FaturaStatus.Paga, ct);
                    break;
                case "invoice.payment_failed":
                    await OnFaturaAlteradaAsync(ev, FaturaStatus.Falhou, ct);
                    break;
                case "invoice.voided":
                case "invoice.deleted":
                    await OnFaturaAlteradaAsync(ev, FaturaStatus.Cancelada, ct);
                    break;
            }
            registro.MarcarProcessado();
            await _db.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            registro.MarcarErro(ex.Message);
            await _db.SaveChangesAsync(ct);
            _log.LogError(ex, "Erro processando evento {Id} tipo {Tipo}", ev.Id, ev.Type);
        }
    }

    private async Task OnSubscriptionAlteradaAsync(Event ev, CancellationToken ct)
    {
        var sub = ev.Data.Object as Subscription;
        if (sub is null) return;
        var assin = await _db.Assinaturas.IgnoreQueryFilters()
            .FirstOrDefaultAsync(a => a.StripeSubscriptionId == sub.Id, ct);
        if (assin is null) return;

        assin.AlterarStatus(MapStatus(sub.Status));
        if (sub.CurrentPeriodEnd != default)
            assin.DefinirProximaCobranca(sub.CurrentPeriodEnd);

        // Sincroniza Tenant.Status
        var tenant = await _db.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == assin.TenantId, ct);
        if (tenant is not null)
        {
            tenant.AlterarStatus(sub.Status switch
            {
                "active" or "trialing" => TenantStatus.Ativo,
                "past_due" => TenantStatus.EmAtraso,
                "canceled" or "unpaid" => TenantStatus.Suspenso,
                _ => tenant.Status
            });
        }
    }

    private async Task OnSubscriptionCanceladaAsync(Event ev, CancellationToken ct)
    {
        var sub = ev.Data.Object as Subscription;
        if (sub is null) return;
        var assin = await _db.Assinaturas.IgnoreQueryFilters()
            .FirstOrDefaultAsync(a => a.StripeSubscriptionId == sub.Id, ct);
        if (assin is null) return;
        assin.MarcarCancelada();
        var tenant = await _db.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == assin.TenantId, ct);
        tenant?.AlterarStatus(TenantStatus.Cancelado);
    }

    private async Task OnFaturaAlteradaAsync(Event ev, FaturaStatus status, CancellationToken ct)
    {
        var inv = ev.Data.Object as Invoice;
        if (inv is null) return;

        // Localiza o tenant pela subscription
        var subId = inv.SubscriptionId;
        var assin = string.IsNullOrEmpty(subId) ? null
            : await _db.Assinaturas.IgnoreQueryFilters().FirstOrDefaultAsync(a => a.StripeSubscriptionId == subId, ct);
        if (assin is null)
        {
            _log.LogWarning("Fatura {Id} não vinculada a assinatura conhecida.", inv.Id);
            return;
        }

        var fatura = await _db.Faturas.IgnoreQueryFilters()
            .FirstOrDefaultAsync(f => f.StripeInvoiceId == inv.Id, ct);

        var vencimento = inv.DueDate ?? inv.Created;
        var pagoEm = inv.StatusTransitions?.PaidAt;
        var paymentMethod = inv.Charge?.PaymentMethodDetails?.Type;
        var linkPagamento = inv.HostedInvoiceUrl;
        var linkPdf = inv.InvoicePdf;
        var valor = (int)(inv.AmountDue);

        if (fatura is null)
        {
            fatura = Fatura.Criar(
                assin.TenantId, assin.Id, inv.Id, inv.Number,
                valor, vencimento, status,
                paymentMethod, linkPagamento, linkPdf);
            _db.Faturas.Add(fatura);
        }
        else
        {
            fatura.Atualizar(valor, vencimento, status, paymentMethod, linkPagamento, linkPdf, pagoEm);
        }
    }

    private static AssinaturaStatus MapStatus(string stripeStatus) => stripeStatus switch
    {
        "trialing" => AssinaturaStatus.Trialing,
        "active" => AssinaturaStatus.Active,
        "past_due" => AssinaturaStatus.PastDue,
        "canceled" or "unpaid" => AssinaturaStatus.Canceled,
        _ => AssinaturaStatus.Incomplete
    };
}
