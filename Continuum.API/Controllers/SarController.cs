using Continuum.API.DTOs;
using Continuum.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Continuum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SarController : ControllerBase
{
    private readonly ISarService _sarService;

    public SarController(ISarService sarService) => _sarService = sarService;

    // No [Authorize] — client-facing tokenized endpoint
    [HttpGet("{token}")]
    public async Task<ActionResult<SarFormDto>> GetSarForm(string token)
    {
        var form = await _sarService.GetFormByTokenAsync(token);
        return form is null
            ? NotFound(new { error = "This link is invalid or has expired. Please contact your county office." })
            : Ok(form);
    }

    [HttpPost("{token}/submit")]
    public async Task<ActionResult<SarSubmitResponse>> SubmitSar(
        string token,
        [FromBody] SarSubmitRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _sarService.SubmitAsync(token, request, ipAddress, userAgent);
        return result is null
            ? BadRequest(new { error = "Submission failed. The link may be invalid, expired, or already used." })
            : Ok(result);
    }
}
