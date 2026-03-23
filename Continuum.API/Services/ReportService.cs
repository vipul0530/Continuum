using Continuum.API.Data;
using Continuum.API.DTOs;
using Continuum.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Continuum.API.Services;

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _db;

    public ReportService(ApplicationDbContext db) => _db = db;

    public async Task<ReportSummaryDto?> GetSummaryAsync(int countyId)
    {
        var county = await _db.Counties.FindAsync(countyId);
        if (county is null) return null;

        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var cases = await _db.Cases
            .Where(c => c.CountyId == countyId)
            .ToListAsync();

        var activeCases = cases.Where(c =>
            c.Status == CaseStatus.Active || c.Status == CaseStatus.PendingSubmission).ToList();

        var submittedThisMonth = cases.Count(c =>
            c.Status == CaseStatus.Submitted && c.SubmittedAt >= monthStart);

        var terminatedThisMonth = cases.Count(c =>
            c.Status == CaseStatus.Terminated && c.UpdatedAt >= monthStart);

        var outreachThisMonth = await _db.OutreachLogs
            .CountAsync(l => l.CountyId == countyId && l.SentAt >= monthStart &&
                             l.Status != OutreachStatus.Failed);

        var totalDue = activeCases.Count + submittedThisMonth + terminatedThisMonth;
        var complianceRate = totalDue > 0
            ? Math.Round((double)submittedThisMonth / totalDue * 100, 1)
            : 0;

        // $175 per avoided termination
        var estimatedSavings = submittedThisMonth * 175.0;

        return new ReportSummaryDto(
            countyId,
            county.Name,
            activeCases.Count,
            activeCases.Count(c => c.UrgencyLevel == UrgencyLevel.Red),
            activeCases.Count(c => c.UrgencyLevel == UrgencyLevel.Yellow),
            activeCases.Count(c => c.UrgencyLevel == UrgencyLevel.Green),
            submittedThisMonth,
            terminatedThisMonth,
            outreachThisMonth,
            complianceRate,
            estimatedSavings
        );
    }
}
