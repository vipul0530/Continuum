using Continuum.API.DTOs;
using Continuum.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Continuum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService) => _reportService = reportService;

    [HttpGet("summary")]
    public async Task<ActionResult<ReportSummaryDto>> GetSummary([FromQuery] int? countyId)
    {
        var resolved = countyId ?? GetCountyId();
        if (!resolved.HasValue) return Forbid();

        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var claimCountyId = GetCountyId();

        // Non-admins can only view their own county
        if (role != "Admin" && resolved != claimCountyId)
            return Forbid();

        var summary = await _reportService.GetSummaryAsync(resolved.Value);
        return summary is null ? NotFound() : Ok(summary);
    }

    private int? GetCountyId()
    {
        var claim = User.FindFirst("county_id")?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }
}
