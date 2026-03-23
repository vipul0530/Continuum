using Continuum.API.DTOs;

namespace Continuum.API.Services;

public interface IReportService
{
    Task<ReportSummaryDto?> GetSummaryAsync(int countyId);
}
