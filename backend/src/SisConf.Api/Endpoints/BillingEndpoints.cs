using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SisConf.Application.Common.Auth;
using SisConf.Application.Common.Tenants;
using SisConf.Application.Faturamento;
using SisConf.Infrastructure.Auth.Authorization;
using SisConf.Infrastructure.Faturamento;
using SisConf.Infrastructure.Persistencia;

namespace SisConf.Api.Endpoints;

public record AssinaturaDto(
    Guid Id, string PlanoCodigo, string PlanoNome, int PrecoMensalCentavos, int LimiteImportacoesMes,
    string Status, DateTime IniciadaEm, DateTime? ProximaCobrancaEm, string? StripeSubscriptionId);

public record UsoDto(int AnoMes, int ImportacoesCount, int LimiteImportacoesMes);

public record AlterarPlanoReq(string PlanoCodigo);

public record FaturaDto(
    Guid Id, string StripeInvoiceId, string? Numero,
    int ValorCentavos, DateTime Vencimento, string Status,
    DateTime? PagoEm, string? PaymentMethod, string? LinkPagamento, string? LinkPdf, DateTime CriadoEm);

public static class BillingEndpoints
{
    public static IEndpointRouteBuilder MapBillingEndpoints(this IEndpointRouteBuilder app)
    {
        // Webhook PÚBLICO (sem auth)
        app.MapPost("/api/webhooks/stripe", async (
            HttpContext http, StripeWebhookHandler handler, CancellationToken ct) =>
        {
            using var reader = new StreamReader(http.Request.Body);
            var corpo = await reader.ReadToEndAsync(ct);
            var assinatura = http.Request.Headers["Stripe-Signature"].FirstOrDefault() ?? "";
            var ev = handler.ValidarAssinatura(corpo, assinatura);
            if (ev is null) return Results.BadRequest(new { erro = "Assinatura Stripe inválida ou webhook desabilitado." });
            await handler.ProcessarAsync(ev, ct);
            return Results.Ok();
        }).WithTags("Webhooks").WithName("StripeWebhook");

        // Endpoints autenticados
        var assin = app.MapGroup("/api/assinatura").WithTags("Assinatura").RequireAuthorization();
        var fats = app.MapGroup("/api/faturas").WithTags("Faturas").RequireAuthorization();
        var portal = app.MapGroup("/api/billing").WithTags("Billing").RequireAuthorization();

        assin.MapGet("/", async (SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            var dto = await db.Assinaturas
                .Join(db.Planos, a => a.PlanoId, p => p.Id, (a, p) => new AssinaturaDto(
                    a.Id, p.Codigo, p.Nome, p.PrecoMensalCentavos, p.LimiteImportacoesMes,
                    a.Status.ToString().ToLowerInvariant(), a.IniciadaEm, a.ProximaCobrancaEm,
                    a.StripeSubscriptionId))
                .FirstOrDefaultAsync(ct);
            return dto is null ? Results.NotFound() : Results.Ok(dto);
        }).WithName("ObterAssinatura");

        assin.MapGet("/uso", async (SisConfDbContext db, ITenantContext ctx, CancellationToken ct) =>
        {
            var anoMes = SisConf.Domain.Faturamento.UsoMensal.AnoMesAtual();
            var imp = await db.UsoMensal.Where(u => u.AnoMes == anoMes).Select(u => u.ImportacoesCount).FirstOrDefaultAsync(ct);
            var limite = await db.Tenants
                .Where(t => t.Id == ctx.TenantId && t.PlanoId != null)
                .Join(db.Planos, t => t.PlanoId, p => p.Id, (t, p) => p.LimiteImportacoesMes)
                .FirstOrDefaultAsync(ct);
            return Results.Ok(new UsoDto(anoMes, imp, limite));
        }).WithName("ObterUso");

        assin.MapPost("/alterar-plano", [HasPermission(Permissoes.Faturas.Gerenciar)]
            async (AlterarPlanoReq req, SisConfDbContext db, IStripeService stripe,
                ITenantContext ctx, CancellationToken ct) =>
        {
            var plano = await db.Planos.FirstOrDefaultAsync(p => p.Codigo == req.PlanoCodigo && p.Ativo, ct);
            if (plano is null) return Results.BadRequest(new { erro = "Plano inválido.", codigo = "plano_invalido" });

            var a = await db.Assinaturas.FirstOrDefaultAsync(ct);
            if (a is null) return Results.NotFound(new { erro = "Assinatura não encontrada." });

            if (!string.IsNullOrEmpty(a.StripeSubscriptionId) && !string.IsNullOrEmpty(plano.StripePriceId))
            {
                await stripe.AlterarPlanoAsync(a.StripeSubscriptionId, plano.StripePriceId, ct);
            }

            a.AlterarPlano(plano.Id);
            var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == ctx.TenantId, ct);
            tenant?.AlterarPlano(plano.Id);
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).WithName("AlterarPlano");

        fats.MapGet("/", [HasPermission(Permissoes.Faturas.Visualizar)]
            async (SisConfDbContext db, CancellationToken ct) =>
        {
            var itens = await db.Faturas
                .OrderByDescending(f => f.Vencimento)
                .Select(f => new FaturaDto(
                    f.Id, f.StripeInvoiceId, f.Numero,
                    f.ValorCentavos, f.Vencimento, f.Status.ToString().ToLowerInvariant(),
                    f.PagoEm, f.PaymentMethod, f.LinkPagamento, f.LinkPdf, f.CriadoEm))
                .ToListAsync(ct);
            return Results.Ok(itens);
        }).WithName("ListarFaturas");

        portal.MapPost("/portal-session", [HasPermission(Permissoes.Faturas.Gerenciar)]
            async (SisConfDbContext db, IStripeService stripe, IOptions<StripeOptions> opts,
                ITenantContext ctx, CancellationToken ct) =>
        {
            var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == ctx.TenantId, ct);
            if (tenant is null || string.IsNullOrEmpty(tenant.StripeCustomerId))
                return Results.BadRequest(new { erro = "Tenant sem customer Stripe vinculado." });
            var session = await stripe.CriarPortalSessionAsync(tenant.StripeCustomerId, opts.Value.PortalReturnUrl, ct);
            return Results.Ok(new { url = session.Url });
        }).WithName("PortalSession");

        return app;
    }
}
