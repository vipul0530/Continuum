using Continuum.API.Data;
using Continuum.API.DTOs;
using Continuum.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Continuum.API.Services;

public class CaseService : ICaseService
{
    private readonly ApplicationDbContext _db;

    public CaseService(ApplicationDbContext db) => _db = db;

    public async Task<PagedResult<CaseListItemDto>> GetCasesAsync(CaseQueryParams query)
    {
        var today = DateTime.UtcNow.Date;

        var q = _db.Cases
            .Include(c => c.Client)
            .Where(c => c.CountyId == query.CountyId);

        if (!string.IsNullOrEmpty(query.Status) &&
            Enum.TryParse<CaseStatus>(query.Status, out var status))
            q = q.Where(c => c.Status == status);

        if (!string.IsNullOrEmpty(query.UrgencyLevel) &&
            Enum.TryParse<UrgencyLevel>(query.UrgencyLevel, out var urgency))
            q = q.Where(c => c.UrgencyLevel == urgency);

        if (query.DueDateFrom.HasValue)
            q = q.Where(c => c.SarDueDate >= query.DueDateFrom.Value);

        if (query.DueDateTo.HasValue)
            q = q.Where(c => c.SarDueDate <= query.DueDateTo.Value);

        if (query.IsAtRisk.HasValue)
            q = q.Where(c => c.IsAtRisk == query.IsAtRisk.Value);

        q = q.OrderBy(c => c.SarDueDate);

        var total = await q.CountAsync();

        var items = await q
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(c => new CaseListItemDto(
                c.Id,
                c.CaseNumber,
                c.Client.FirstName + " " + c.Client.LastName,
                c.Client.PhoneNumber,
                c.Client.Email,
                c.SarDueDate,
                (int)(c.SarDueDate.Date - today).TotalDays,
                c.Status.ToString(),
                c.UrgencyLevel.ToString(),
                c.IsAtRisk,
                c.OutreachAttempts,
                c.LastOutreachAt,
                c.SubmittedAt
            ))
            .ToListAsync();

        return new PagedResult<CaseListItemDto>(items, total, query.Page, query.PageSize);
    }

    public async Task<CaseDetailDto?> GetCaseByIdAsync(int id, int countyId)
    {
        var today = DateTime.UtcNow.Date;

        var c = await _db.Cases
            .Include(x => x.Client)
            .Include(x => x.OutreachLogs.OrderByDescending(l => l.SentAt))
            .FirstOrDefaultAsync(x => x.Id == id && x.CountyId == countyId);

        if (c is null) return null;

        return new CaseDetailDto(
            c.Id,
            c.CaseNumber,
            c.ClientId,
            c.Client.FullName,
            c.Client.PhoneNumber,
            c.Client.Email,
            c.Client.PreferredLanguage,
            c.SarDueDate,
            (int)(c.SarDueDate.Date - today).TotalDays,
            c.Status.ToString(),
            c.UrgencyLevel.ToString(),
            c.IsAtRisk,
            c.OutreachAttempts,
            c.LastOutreachAt,
            c.SubmittedAt,
            c.OutreachLogs.Select(l => new OutreachLogDto(
                l.Id,
                l.Channel.ToString(),
                l.Status.ToString(),
                l.MessageTemplate,
                l.DaysBeforeDue,
                l.SentAt,
                l.DeliveredAt,
                l.ErrorMessage
            ))
        );
    }

    public async Task<int> ImportCasesAsync(int countyId, IEnumerable<CaseImportDto> imports)
    {
        var today = DateTime.UtcNow.Date;
        int imported = 0;

        foreach (var dto in imports)
        {
            var client = await _db.Clients
                .FirstOrDefaultAsync(c => c.CountyId == countyId && c.CalSawsId == dto.CalSawsId)
                ?? new Client { CountyId = countyId, CreatedAt = DateTime.UtcNow };

            client.FirstName = dto.ClientFirstName;
            client.LastName = dto.ClientLastName;
            client.PhoneNumber = dto.ClientPhone;
            client.Email = dto.ClientEmail;
            client.CalSawsId = dto.CalSawsId;
            client.PreferredLanguage = dto.PreferredLanguage ?? "en";
            client.UpdatedAt = DateTime.UtcNow;

            if (client.Id == 0) _db.Clients.Add(client);

            await _db.SaveChangesAsync();

            var existingCase = await _db.Cases
                .FirstOrDefaultAsync(c => c.CountyId == countyId && c.CaseNumber == dto.CaseNumber);

            if (existingCase is null)
            {
                var days = (int)(dto.SarDueDate.Date - today).TotalDays;
                _db.Cases.Add(new Case
                {
                    CountyId = countyId,
                    ClientId = client.Id,
                    CaseNumber = dto.CaseNumber,
                    SarDueDate = dto.SarDueDate,
                    Status = CaseStatus.Active,
                    UrgencyLevel = ComputeUrgency(days),
                    IsAtRisk = days <= 7,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
                imported++;
            }
            else
            {
                var days = (int)(dto.SarDueDate.Date - today).TotalDays;
                existingCase.SarDueDate = dto.SarDueDate;
                existingCase.ClientId = client.Id;
                existingCase.UrgencyLevel = ComputeUrgency(days);
                existingCase.IsAtRisk = days <= 7;
                existingCase.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();
        }

        return imported;
    }

    public async Task RefreshUrgencyLevelsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var activeCases = await _db.Cases
            .Where(c => c.Status == CaseStatus.Active || c.Status == CaseStatus.PendingSubmission)
            .ToListAsync();

        foreach (var c in activeCases)
        {
            var days = (int)(c.SarDueDate.Date - today).TotalDays;
            c.UrgencyLevel = ComputeUrgency(days);
            c.IsAtRisk = days <= 7;
            c.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
    }

    private static UrgencyLevel ComputeUrgency(int daysUntilDue) => daysUntilDue switch
    {
        <= 7  => UrgencyLevel.Red,
        <= 14 => UrgencyLevel.Yellow,
        _     => UrgencyLevel.Green
    };
}
