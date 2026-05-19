namespace SisConf.Application.Faturamento;

public record StripeCustomerResultado(string CustomerId);
public record StripeSubscriptionResultado(string SubscriptionId, string Status);
public record StripePortalSession(string Url);

public interface IStripeService
{
    bool Habilitado { get; }
    Task<StripeCustomerResultado> CriarCustomerAsync(string email, string nome, string? documento, CancellationToken ct = default);
    Task<StripeSubscriptionResultado> CriarSubscriptionAsync(string customerId, string priceId, int trialDays, CancellationToken ct = default);
    Task CancelarSubscriptionAsync(string subscriptionId, CancellationToken ct = default);
    Task<StripeSubscriptionResultado> AlterarPlanoAsync(string subscriptionId, string novoPriceId, CancellationToken ct = default);
    Task<StripePortalSession> CriarPortalSessionAsync(string customerId, string returnUrl, CancellationToken ct = default);
}
