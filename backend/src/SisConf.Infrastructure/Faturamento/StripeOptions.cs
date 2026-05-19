namespace SisConf.Infrastructure.Faturamento;

public class StripeOptions
{
    public const string SecaoConfig = "Stripe";

    public string? SecretKey { get; set; }
    public string? WebhookSecret { get; set; }
    public string PortalReturnUrl { get; set; } = "http://localhost:5173/app/faturas";

    public bool Habilitado => !string.IsNullOrWhiteSpace(SecretKey);
}
