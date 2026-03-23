using Continuum.API.DTOs;

namespace Continuum.API.Services;

public interface IOutreachService
{
    Task<IEnumerable<OutreachLogDto>> GetOutreachHistoryAsync(int caseId, int countyId);
    Task<bool> SendOutreachAsync(SendOutreachRequest request, int countyId);
    Task ProcessScheduledOutreachAsync(CancellationToken ct);
}
