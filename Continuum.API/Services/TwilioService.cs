using Twilio;
using Twilio.Rest.Api.V2010.Account;

namespace Continuum.API.Services;

public class TwilioService : ITwilioService
{
    private readonly IConfiguration _config;
    private readonly ILogger<TwilioService> _logger;

    public TwilioService(IConfiguration config, ILogger<TwilioService> logger)
    {
        _config = config;
        _logger = logger;

        var accountSid = _config["Twilio:AccountSid"];
        var authToken = _config["Twilio:AuthToken"];

        if (!string.IsNullOrEmpty(accountSid) && !string.IsNullOrEmpty(authToken))
            TwilioClient.Init(accountSid, authToken);
    }

    public async Task<(bool Success, string? MessageSid, string? Error)> SendSmsAsync(
        string toNumber, string message)
    {
        try
        {
            var fromNumber = _config["Twilio:FromNumber"];
            if (string.IsNullOrEmpty(fromNumber))
                return (false, null, "Twilio FromNumber not configured.");

            var msg = await MessageResource.CreateAsync(
                body: message,
                from: new Twilio.Types.PhoneNumber(fromNumber),
                to: new Twilio.Types.PhoneNumber(toNumber)
            );

            _logger.LogInformation("SMS sent to {Number}, SID: {Sid}", toNumber, msg.Sid);
            return (true, msg.Sid, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SMS to {Number}", toNumber);
            return (false, null, ex.Message);
        }
    }
}
