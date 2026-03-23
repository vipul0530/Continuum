namespace Continuum.API.Services;

public interface ITwilioService
{
    Task<(bool Success, string? MessageSid, string? Error)> SendSmsAsync(string toNumber, string message);
}
