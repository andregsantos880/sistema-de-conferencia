using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.BillingPortal;
using SisConf.Application.Faturamento;

namespace SisConf.Infrastructure.Faturamento;

/// <summary>
/// Wrapper sobre Stripe.net. Quando StripeOptions.SecretKey está vazio (dev sem conta Stripe),
/// retorna IDs fake "stripe_fake_*" para permitir signup local sem chamadas de rede.
/// </summary>
public class StripeService : IStripeService
{
    private readonly StripeOptions _opts;
    private readonly ILogger<StripeService> _log;

    public bool Habilitado => _opts.Habilitado;

    public StripeService(IOptions<StripeOptions> opts, ILogger<StripeService> log)
    {
        _opts = opts.Value;
        _log = log;
        if (_opts.Habilitado)
            StripeConfiguration.ApiKey = _opts.SecretKey;
        else
            _log.LogWarning("Stripe desabilitado (SecretKey vazio) — signup local usará IDs fake.");
    }

    public async Task<StripeCustomerResultado> CriarCustomerAsync(string email, string nome, string? documento, CancellationToken ct = default)
    {
        if (!_opts.Habilitado)
            return new StripeCustomerResultado($"stripe_fake_cus_{Guid.NewGuid():N}");

        var service = new CustomerService();
        var customer = await service.CreateAsync(new CustomerCreateOptions
        {
            Email = email,
            Name = nome,
            Metadata = documento is null ? null : new Dictionary<string, string> { ["documento"] = documento }
        }, cancellationToken: ct);
        return new StripeCustomerResultado(customer.Id);
    }

    public async Task<StripeSubscriptionResultado> CriarSubscriptionAsync(string customerId, string priceId, int trialDays, CancellationToken ct = default)
    {
        if (!_opts.Habilitado)
            return new StripeSubscriptionResultado($"stripe_fake_sub_{Guid.NewGuid():N}", "trialing");

        var service = new SubscriptionService();
        var sub = await service.CreateAsync(new SubscriptionCreateOptions
        {
            Customer = customerId,
            Items = new List<SubscriptionItemOptions> { new() { Price = priceId } },
            TrialPeriodDays = trialDays,
            PaymentSettings = new SubscriptionPaymentSettingsOptions
            {
                PaymentMethodTypes = new List<string> { "card", "boleto" }
            },
            CollectionMethod = "charge_automatically"
        }, cancellationToken: ct);
        return new StripeSubscriptionResultado(sub.Id, sub.Status);
    }

    public async Task CancelarSubscriptionAsync(string subscriptionId, CancellationToken ct = default)
    {
        if (!_opts.Habilitado) return;
        var service = new SubscriptionService();
        await service.CancelAsync(subscriptionId, cancellationToken: ct);
    }

    public async Task<StripeSubscriptionResultado> AlterarPlanoAsync(string subscriptionId, string novoPriceId, CancellationToken ct = default)
    {
        if (!_opts.Habilitado)
            return new StripeSubscriptionResultado(subscriptionId, "active");

        var service = new SubscriptionService();
        var atual = await service.GetAsync(subscriptionId, cancellationToken: ct);
        var itemId = atual.Items.Data[0].Id;
        var sub = await service.UpdateAsync(subscriptionId, new SubscriptionUpdateOptions
        {
            Items = new List<SubscriptionItemOptions>
            {
                new() { Id = itemId, Price = novoPriceId }
            },
            ProrationBehavior = "create_prorations"
        }, cancellationToken: ct);
        return new StripeSubscriptionResultado(sub.Id, sub.Status);
    }

    public async Task<StripePortalSession> CriarPortalSessionAsync(string customerId, string returnUrl, CancellationToken ct = default)
    {
        if (!_opts.Habilitado)
            return new StripePortalSession($"{returnUrl}?stripe_disabled=true");

        var service = new SessionService();
        var s = await service.CreateAsync(new SessionCreateOptions
        {
            Customer = customerId,
            ReturnUrl = returnUrl
        }, cancellationToken: ct);
        return new StripePortalSession(s.Url);
    }
}
