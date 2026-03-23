using Continuum.API.DTOs;

namespace Continuum.API.Services;

public interface ISarService
{
    Task<SarFormDto?> GetFormByTokenAsync(string token);
    Task<SarSubmitResponse?> SubmitAsync(
        string token,
        SarSubmitRequest request,
        string? ipAddress,
        string? userAgent);
    Task<string> GenerateTokenAsync(int caseId, int countyId);
}
