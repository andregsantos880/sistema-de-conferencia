namespace ConferSystem.API.Services;

public interface IEmailService
{
    Task SendConfirmationEmailAsync(string toEmail, string toName, string confirmationToken);
    Task SendTrialExpiringEmailAsync(string toEmail, string toName, int daysLeft);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendConfirmationEmailAsync(string toEmail, string toName, string confirmationToken)
    {
        var baseUrl = _config["App:BaseUrl"] ?? "https://localhost:5001";
        var confirmUrl = $"{baseUrl}/api/auth/confirm-email?token={confirmationToken}";

        // In production: use SendGrid, SES, or SMTP
        _logger.LogInformation(
            "[EMAIL] Sending confirmation to {Email}. Confirm URL: {Url}",
            toEmail, confirmUrl);

        // Simulate async email send
        await Task.Delay(10);
    }

    public async Task SendTrialExpiringEmailAsync(string toEmail, string toName, int daysLeft)
    {
        _logger.LogInformation(
            "[EMAIL] Sending trial expiry warning to {Email} ({DaysLeft} days left)",
            toEmail, daysLeft);

        await Task.Delay(10);
    }
}
