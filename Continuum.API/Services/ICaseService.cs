using Continuum.API.DTOs;

namespace Continuum.API.Services;

public interface ICaseService
{
    Task<PagedResult<CaseListItemDto>> GetCasesAsync(CaseQueryParams query);
    Task<CaseDetailDto?> GetCaseByIdAsync(int id, int countyId);
    Task<int> ImportCasesAsync(int countyId, IEnumerable<CaseImportDto> imports);
    Task RefreshUrgencyLevelsAsync();
}
