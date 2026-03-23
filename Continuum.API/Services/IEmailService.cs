namespace Continuum.API.Services;

public interface IEmailService
{
    Task<(bool Success, string? MessageId, string? Error)> SendEmailAsync(
        string toAddress,
        string toName,
        string subject,
        string body);
}
