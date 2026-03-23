using System.Security.Cryptography;
using System.Text.Json;
using Continuum.API.Data;
using Continuum.API.DTOs;
using Continuum.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Continuum.API.Services;

public class SarService : ISarService
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<SarService> _logger;

    public SarService(ApplicationDbContext db, ILogger<SarService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<SarFormDto?> GetFormByTokenAsync(string token)
    {
        var today = DateTime.UtcNow.Date;

        var submission = await _db.SarSubmissions
            .Include(s => s.Case)
                .ThenInclude(c => c.Client)
            .FirstOrDefaultAsync(s =>
                s.Token == token &&
                s.TokenExpiry > DateTime.UtcNow &&
                !s.IsSubmitted);

        if (submission is null) return null;

        var c = submission.Case;
        return new SarFormDto(
            c.CaseNumber,
            c.Client.FirstName,
            c.Client.LastName,
            c.SarDueDate,
            (int)(c.SarDueDate.Date - today).TotalDays,
            c.Client.PreferredLanguage
        );
    }

    public async Task<SarSubmitResponse?> SubmitAsync(
        string token,
        SarSubmitRequest request,
        string? ipAddress,
        string? userAgent)
    {
        var submission = await _db.SarSubmissions
            .Include(s => s.Case)
            .FirstOrDefaultAsync(s =>
                s.Token == token &&
                s.TokenExpiry > DateTime.UtcNow &&
                !s.IsSubmitted);

        if (submission is null) return null;

        submission.IsSubmitted = true;
        submission.SubmittedAt = DateTime.UtcNow;
        submission.FormDataJson = JsonSerializer.Serialize(request);
        submission.IpAddress = ipAddress;
        submission.UserAgent = userAgent;

        var c = submission.Case;
        c.Status = CaseStatus.Submitted;
        c.SubmittedAt = DateTime.UtcNow;
        c.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var confirmationNumber = $"SAR-{c.CaseNumber}-{DateTime.UtcNow:yyyyMMddHHmm}";
        _logger.LogInformation("SAR-7 submitted for case {CaseId}, confirmation {Confirmation}",
            c.Id, confirmationNumber);

        return new SarSubmitResponse(true, confirmationNumber, submission.SubmittedAt.Value);
    }

    public async Task<string> GenerateTokenAsync(int caseId, int countyId)
    {
        var existing = await _db.SarSubmissions
            .FirstOrDefaultAsync(s => s.CaseId == caseId && !s.IsSubmitted);

        if (existing is not null)
        {
            existing.TokenExpiry = DateTime.UtcNow.AddDays(30);
            await _db.SaveChangesAsync();
            return existing.Token;
        }

        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
            .Replace("+", "-").Replace("/", "_").Replace("=", "");

        _db.SarSubmissions.Add(new SarSubmission
        {
            CaseId = caseId,
            CountyId = countyId,
            Token = token,
            TokenExpiry = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return token;
    }
}
