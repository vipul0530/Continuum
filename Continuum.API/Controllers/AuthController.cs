using Continuum.API.DTOs;
using Continuum.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Continuum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        return result is null ? Unauthorized(new { error = "Invalid email or password." }) : Ok(result);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<WorkerProfileDto>> GetCurrentUser()
    {
        var workerIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(workerIdClaim, out var workerId)) return Unauthorized();

        var profile = await _authService.GetWorkerProfileAsync(workerId);
        return profile is null ? NotFound() : Ok(profile);
    }
}
