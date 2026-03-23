using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Continuum.API.Data;
using Continuum.API.DTOs;
using Continuum.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Continuum.API.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(ApplicationDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var worker = await _db.Workers
            .Include(w => w.County)
            .FirstOrDefaultAsync(w => w.Email == request.Email.ToLower() && w.IsActive);

        if (worker is null || string.IsNullOrEmpty(worker.PasswordHash))
            return null;

        if (!BCrypt.Net.BCrypt.Verify(request.Password, worker.PasswordHash))
            return null;

        var expiryMinutes = _config.GetValue<int>("Auth:TokenExpiryMinutes", 480);
        var token = GenerateJwtToken(worker, expiryMinutes);

        return new LoginResponse(
            token,
            "Bearer",
            expiryMinutes * 60,
            new WorkerProfileDto(
                worker.Id,
                worker.CountyId,
                worker.County.Name,
                worker.Email,
                worker.FullName,
                worker.Role.ToString()
            )
        );
    }

    public async Task<WorkerProfileDto?> GetWorkerProfileAsync(int workerId)
    {
        var worker = await _db.Workers
            .Include(w => w.County)
            .FirstOrDefaultAsync(w => w.Id == workerId && w.IsActive);

        return worker is null
            ? null
            : new WorkerProfileDto(
                worker.Id,
                worker.CountyId,
                worker.County.Name,
                worker.Email,
                worker.FullName,
                worker.Role.ToString()
            );
    }

    private string GenerateJwtToken(Worker worker, int expiryMinutes)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Auth:JwtSecret"]!));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, worker.Id.ToString()),
            new Claim(ClaimTypes.Email, worker.Email),
            new Claim(ClaimTypes.Role, worker.Role.ToString()),
            new Claim("county_id", worker.CountyId.ToString()),
            new Claim("county_name", worker.County.Name),
            new Claim("full_name", worker.FullName)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Auth:Issuer"],
            audience: _config["Auth:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
