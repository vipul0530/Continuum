using Continuum.API.DTOs;
using Continuum.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Continuum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OutreachController : ControllerBase
{
    private readonly IOutreachService _outreachService;

    public OutreachController(IOutreachService outreachService) => _outreachService = outreachService;

    [HttpGet("{caseId:int}")]
    public async Task<ActionResult<IEnumerable<OutreachLogDto>>> GetOutreachHistory(int caseId)
    {
        var countyId = GetCountyId();
        if (!countyId.HasValue) return Forbid();

        var logs = await _outreachService.GetOutreachHistoryAsync(caseId, countyId.Value);
        return Ok(logs);
    }

    [HttpPost("send")]
    public async Task<ActionResult> SendOutreach([FromBody] SendOutreachRequest request)
    {
        var countyId = GetCountyId();
        if (!countyId.HasValue) return Forbid();

        var success = await _outreachService.SendOutreachAsync(request, countyId.Value);
        return success
            ? Ok(new { message = "Outreach sent successfully." })
            : StatusCode(500, new { error = "Failed to send outreach. Check configuration and try again." });
    }

    private int? GetCountyId()
    {
        var claim = User.FindFirst("county_id")?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }
}
