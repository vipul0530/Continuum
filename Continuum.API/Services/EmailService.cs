using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Continuum.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<(bool Success, string? MessageId, string? Error)> SendEmailAsync(
        string toAddress,
        string toName,
        string subject,
        string body)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _config["Email:FromName"] ?? "Continuum",
                _config["Email:FromAddress"] ?? "noreply@waymarklab.com"));
            message.To.Add(new MailboxAddress(toName, toAddress));
            message.Subject = subject;

            var builder = new BodyBuilder
            {
                HtmlBody = BuildHtmlBody(body),
                TextBody = body
            };
            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(
                _config["Email:SmtpHost"],
                _config.GetValue<int>("Email:SmtpPort", 587),
                SecureSocketOptions.StartTls);

            await client.AuthenticateAsync(
                _config["Email:SmtpUser"],
                _config["Email:SmtpPassword"]);

            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent to {Address}, Subject: {Subject}", toAddress, subject);
            return (true, message.MessageId, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Address}", toAddress);
            return (false, null, ex.Message);
        }
    }

    private static string BuildHtmlBody(string plainText) => $"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #1B3A6B; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Continuum — CalFresh Benefits</h1>
          </div>
          <div style="background-color: #F8F9FA; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #dee2e6;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">{plainText.Replace("\n", "<br>")}</p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 16px; text-align: center;">
            Waymark Lab · Continuum SAR-7 Outreach System
          </p>
        </body>
        </html>
        """;
}
