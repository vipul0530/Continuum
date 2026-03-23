using Continuum.API.Services;

namespace Continuum.API.BackgroundJobs;

public class OutreachSchedulerJob
{
    private readonly IOutreachService _outreachService;
    private readonly ICaseService _caseService;
    private readonly ILogger<OutreachSchedulerJob> _logger;

    public OutreachSchedulerJob(
        IOutreachService outreachService,
        ICaseService caseService,
        ILogger<OutreachSchedulerJob> logger)
    {
        _outreachService = outreachService;
        _caseService = caseService;
        _logger = logger;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        _logger.LogInformation("Nightly outreach job starting at {Time}", DateTime.UtcNow);

        try
        {
            await _caseService.RefreshUrgencyLevelsAsync();
            _logger.LogInformation("Urgency levels refreshed.");

            await _outreachService.ProcessScheduledOutreachAsync(ct);
            _logger.LogInformation("Nightly outreach job completed at {Time}", DateTime.UtcNow);
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Nightly outreach job was cancelled.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in nightly outreach job.");
            throw;
        }
    }
}
