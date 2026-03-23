using Continuum.API.Data;
using Continuum.API.DTOs;
using Continuum.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Continuum.API.Services;

public class OutreachService : IOutreachService
{
    private readonly ApplicationDbContext _db;
    private readonly ITwilioService _twilio;
    private readonly IEmailService _email;
    private readonly ILogger<OutreachService> _logger;

    private static readonly int[] OutreachIntervals = { 60, 30, 14, 7 };

    public OutreachService(
        ApplicationDbContext db,
        ITwilioService twilio,
        IEmailService email,
        ILogger<OutreachService> logger)
    {
        _db = db;
        _twilio = twilio;
        _email = email;
        _logger = logger;
    }

    public async Task<IEnumerable<OutreachLogDto>> GetOutreachHistoryAsync(int caseId, int countyId)
    {
        return await _db.OutreachLogs
            .Where(l => l.CaseId == caseId && l.CountyId == countyId)
            .OrderByDescending(l => l.SentAt)
            .Select(l => new OutreachLogDto(
                l.Id,
                l.Channel.ToString(),
                l.Status.ToString(),
                l.MessageTemplate,
                l.DaysBeforeDue,
                l.SentAt,
                l.DeliveredAt,
                l.ErrorMessage
            ))
            .ToListAsync();
    }

    public async Task<bool> SendOutreachAsync(SendOutreachRequest request, int countyId)
    {
        var caseEntity = await _db.Cases
            .Include(c => c.Client)
            .FirstOrDefaultAsync(c => c.Id == request.CaseId && c.CountyId == countyId);

        if (caseEntity is null) return false;

        var today = DateTime.UtcNow.Date;
        var daysUntilDue = (int)(caseEntity.SarDueDate.Date - today).TotalDays;

        if (!Enum.TryParse<OutreachChannel>(request.Channel, out var channel))
            return false;

        var message = BuildMessage(caseEntity, daysUntilDue, request.TemplateOverride);
        var template = request.TemplateOverride ?? $"sar7-reminder-{daysUntilDue}d";

        bool success;
        string? externalId = null;
        string? errorMessage = null;

        if (channel == OutreachChannel.Sms && !string.IsNullOrEmpty(caseEntity.Client.PhoneNumber))
        {
            var (sent, sid, err) = await _twilio.SendSmsAsync(caseEntity.Client.PhoneNumber, message);
            success = sent;
            externalId = sid;
            errorMessage = err;
        }
        else if (channel == OutreachChannel.Email && !string.IsNullOrEmpty(caseEntity.Client.Email))
        {
            var (sent, msgId, err) = await _email.SendEmailAsync(
                caseEntity.Client.Email,
                caseEntity.Client.FullName,
                BuildEmailSubject(daysUntilDue),
                message);
            success = sent;
            externalId = msgId;
            errorMessage = err;
        }
        else
        {
            return false;
        }

        var log = new OutreachLog
        {
            CaseId = caseEntity.Id,
            CountyId = countyId,
            Channel = channel,
            Status = success ? OutreachStatus.Sent : OutreachStatus.Failed,
            MessageTemplate = template,
            MessageBody = message,
            ExternalMessageId = externalId,
            DaysBeforeDue = daysUntilDue,
            SentAt = DateTime.UtcNow,
            ErrorMessage = errorMessage
        };

        _db.OutreachLogs.Add(log);

        caseEntity.OutreachAttempts++;
        caseEntity.LastOutreachAt = DateTime.UtcNow;
        caseEntity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return success;
    }

    public async Task ProcessScheduledOutreachAsync(CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;

        foreach (var interval in OutreachIntervals)
        {
            var targetDate = today.AddDays(interval);

            var cases = await _db.Cases
                .Include(c => c.Client)
                .Where(c =>
                    c.SarDueDate.Date == targetDate &&
                    (c.Status == CaseStatus.Active || c.Status == CaseStatus.PendingSubmission))
                .ToListAsync(ct);

            foreach (var c in cases)
            {
                ct.ThrowIfCancellationRequested();

                var alreadySentSms = await _db.OutreachLogs.AnyAsync(
                    l => l.CaseId == c.Id && l.Channel == OutreachChannel.Sms &&
                         l.DaysBeforeDue == interval && l.Status != OutreachStatus.Failed, ct);

                var alreadySentEmail = await _db.OutreachLogs.AnyAsync(
                    l => l.CaseId == c.Id && l.Channel == OutreachChannel.Email &&
                         l.DaysBeforeDue == interval && l.Status != OutreachStatus.Failed, ct);

                if (!alreadySentSms && !string.IsNullOrEmpty(c.Client.PhoneNumber))
                {
                    await SendOutreachAsync(
                        new SendOutreachRequest(c.Id, OutreachChannel.Sms.ToString(), null),
                        c.CountyId);
                    _logger.LogInformation("SMS sent for case {CaseId}, {Days} days before due", c.Id, interval);
                }

                if (!alreadySentEmail && !string.IsNullOrEmpty(c.Client.Email))
                {
                    await SendOutreachAsync(
                        new SendOutreachRequest(c.Id, OutreachChannel.Email.ToString(), null),
                        c.CountyId);
                    _logger.LogInformation("Email sent for case {CaseId}, {Days} days before due", c.Id, interval);
                }

                // Escalate unresponsive cases at 7-day mark
                if (interval == 7 && c.OutreachAttempts >= 3)
                {
                    c.IsAtRisk = true;
                    c.UpdatedAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync(ct);
                }
            }
        }
    }

    private static string BuildMessage(Case c, int daysUntilDue, string? override_)
    {
        if (!string.IsNullOrEmpty(override_)) return override_;

        var dueText = daysUntilDue > 0
            ? $"in {daysUntilDue} day{(daysUntilDue == 1 ? "" : "s")}"
            : "TODAY";

        return $"Hi {c.Client.FirstName}, your CalFresh SAR-7 report is due {dueText} " +
               $"({c.SarDueDate:M/d/yyyy}). Complete it now to keep your benefits: " +
               $"[link provided separately]. Case #{c.CaseNumber}. " +
               "Reply STOP to opt out.";
    }

    private static string BuildEmailSubject(int daysUntilDue) => daysUntilDue switch
    {
        <= 0  => "ACTION REQUIRED: Your CalFresh SAR-7 is due TODAY",
        <= 7  => $"Urgent: Your CalFresh SAR-7 is due in {daysUntilDue} days",
        <= 14 => $"Reminder: Your CalFresh SAR-7 is due in {daysUntilDue} days",
        _     => $"Heads up: Your CalFresh SAR-7 is due in {daysUntilDue} days"
    };
}
