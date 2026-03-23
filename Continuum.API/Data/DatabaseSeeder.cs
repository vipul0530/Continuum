using Continuum.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Continuum.API.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext db)
    {
        // Only seed if no workers exist yet
        if (await db.Workers.AnyAsync()) return;

        var now   = DateTime.UtcNow;
        var today = DateTime.UtcNow.Date;

        // ── Workers ───────────────────────────────────────────────────────────
        await db.Workers.AddRangeAsync(new List<Worker>
        {
            new() { CountyId = 1, Email = "admin@sandiegocounty.gov",      FirstName = "Maria",  LastName = "Gonzalez", Role = WorkerRole.Admin,      PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),  IsActive = true, CreatedAt = now, UpdatedAt = now },
            new() { CountyId = 1, Email = "supervisor@sandiegocounty.gov", FirstName = "James",  LastName = "Okafor",   Role = WorkerRole.Supervisor,  PasswordHash = BCrypt.Net.BCrypt.HashPassword("Super@123"),  IsActive = true, CreatedAt = now, UpdatedAt = now },
            new() { CountyId = 1, Email = "worker@sandiegocounty.gov",     FirstName = "Linda",  LastName = "Tran",     Role = WorkerRole.Worker,      PasswordHash = BCrypt.Net.BCrypt.HashPassword("Worker@123"), IsActive = true, CreatedAt = now, UpdatedAt = now },
            new() { CountyId = 2, Email = "admin@riversidecounty.gov",     FirstName = "Carlos", LastName = "Mendoza",  Role = WorkerRole.Admin,       PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),  IsActive = true, CreatedAt = now, UpdatedAt = now },
        });
        await db.SaveChangesAsync();

        // ── Client + Case seed data ───────────────────────────────────────────
        var rows = new List<(string First, string Last, string Phone, string? Email, string Lang,
            string CaseNum, DateTime DueDate, UrgencyLevel Urgency, CaseStatus Status,
            bool AtRisk, int OutreachCount, DateTime? LastOutreach)>
        {
            // RED — due in 0–7 days
            ("Rosa",    "Alvarez",    "619-555-0101", "ralvarez@gmail.com",   "en", "CS-2024-00441", today.AddDays(2),  UrgencyLevel.Red,    CaseStatus.Active,            true,  2, now.AddDays(-14)),
            ("Darnell", "Washington", "619-555-0102", null,                    "en", "CS-2024-00442", today.AddDays(4),  UrgencyLevel.Red,    CaseStatus.Active,            true,  3, now.AddDays(-7)),
            ("Fatima",  "Hassan",     "619-555-0103", "fhassan@yahoo.com",    "es", "CS-2024-00443", today.AddDays(1),  UrgencyLevel.Red,    CaseStatus.Active,            true,  1, now.AddDays(-30)),
            ("Miguel",  "Reyes",      "619-555-0104", null,                    "es", "CS-2024-00444", today.AddDays(6),  UrgencyLevel.Red,    CaseStatus.Active,            true,  2, now.AddDays(-14)),
            ("Brenda",  "Cooper",     "619-555-0105", "bcooper@hotmail.com",  "en", "CS-2024-00445", today.AddDays(3),  UrgencyLevel.Red,    CaseStatus.Active,            true,  1, now.AddDays(-30)),
            ("Hector",  "Jimenez",    "619-555-0106", null,                    "es", "CS-2024-00446", today.AddDays(0),  UrgencyLevel.Red,    CaseStatus.Active,            true,  3, now.AddDays(-3)),
            ("Tamika",  "Johnson",    "619-555-0107", "tjohnson@gmail.com",   "en", "CS-2024-00447", today.AddDays(5),  UrgencyLevel.Red,    CaseStatus.PendingSubmission, false, 2, now.AddDays(-7)),
            ("Anh",     "Nguyen",     "619-555-0108", "anguyen@outlook.com",  "es", "CS-2024-00448", today.AddDays(7),  UrgencyLevel.Red,    CaseStatus.Active,            true,  1, now.AddDays(-30)),

            // YELLOW — due in 8–14 days
            ("Sandra",  "Martinez",   "619-555-0201", "smartinez@gmail.com",  "es", "CS-2024-00501", today.AddDays(8),  UrgencyLevel.Yellow, CaseStatus.Active,            false, 2, now.AddDays(-22)),
            ("Kevin",   "Brown",      "619-555-0202", null,                    "en", "CS-2024-00502", today.AddDays(10), UrgencyLevel.Yellow, CaseStatus.Active,            false, 1, now.AddDays(-50)),
            ("Linh",    "Pham",       "619-555-0203", "lpham@yahoo.com",      "es", "CS-2024-00503", today.AddDays(12), UrgencyLevel.Yellow, CaseStatus.Active,            false, 2, now.AddDays(-18)),
            ("DeShawn", "Harris",     "619-555-0204", null,                    "en", "CS-2024-00504", today.AddDays(9),  UrgencyLevel.Yellow, CaseStatus.Active,            true,  1, now.AddDays(-50)),
            ("Carmen",  "Flores",     "619-555-0205", "cflores@gmail.com",    "es", "CS-2024-00505", today.AddDays(14), UrgencyLevel.Yellow, CaseStatus.Active,            false, 2, now.AddDays(-16)),
            ("Tyrone",  "Williams",   "619-555-0206", null,                    "en", "CS-2024-00506", today.AddDays(11), UrgencyLevel.Yellow, CaseStatus.Active,            false, 1, now.AddDays(-50)),

            // GREEN — due in 15+ days
            ("Patricia","Kim",        "619-555-0301", "pkim@gmail.com",       "en", "CS-2024-00601", today.AddDays(18), UrgencyLevel.Green,  CaseStatus.Active,            false, 1, now.AddDays(-42)),
            ("Roberto", "Castillo",   "619-555-0302", null,                    "es", "CS-2024-00602", today.AddDays(22), UrgencyLevel.Green,  CaseStatus.Active,            false, 1, now.AddDays(-38)),
            ("Aisha",   "Thompson",   "619-555-0303", "athompson@outlook.com","en", "CS-2024-00603", today.AddDays(30), UrgencyLevel.Green,  CaseStatus.Active,            false, 0, (DateTime?)null),
            ("Jose",    "Ramirez",    "619-555-0304", "jramirez@gmail.com",   "es", "CS-2024-00604", today.AddDays(25), UrgencyLevel.Green,  CaseStatus.Active,            false, 1, now.AddDays(-35)),
            ("Denise",  "Jackson",    "619-555-0305", null,                    "en", "CS-2024-00605", today.AddDays(45), UrgencyLevel.Green,  CaseStatus.Active,            false, 0, (DateTime?)null),

            // SUBMITTED
            ("Maria",   "Lopez",      "619-555-0401", "mlopez@yahoo.com",     "es", "CS-2024-00701", today.AddDays(12), UrgencyLevel.Yellow, CaseStatus.Submitted,         false, 3, now.AddDays(-5)),
            ("Thomas",  "Anderson",   "619-555-0402", "tanderson@gmail.com",  "en", "CS-2024-00702", today.AddDays(20), UrgencyLevel.Green,  CaseStatus.Submitted,         false, 2, now.AddDays(-10)),
        };

        foreach (var r in rows)
        {
            var client = new Client
            {
                CountyId          = 1,
                FirstName         = r.First,
                LastName          = r.Last,
                PhoneNumber       = r.Phone,
                Email             = r.Email,
                PreferredLanguage = r.Lang,
                CalSawsId         = $"SAW{Random.Shared.Next(100000, 999999)}",
                CreatedAt         = now,
                UpdatedAt         = now
            };
            await db.Clients.AddAsync(client);
            await db.SaveChangesAsync();

            var sarCase = new Case
            {
                CountyId         = 1,
                ClientId         = client.Id,
                CaseNumber       = r.CaseNum,
                SarDueDate       = r.DueDate,
                Status           = r.Status,
                UrgencyLevel     = r.Urgency,
                IsAtRisk         = r.AtRisk,
                OutreachAttempts = r.OutreachCount,
                LastOutreachAt   = r.LastOutreach,
                SubmittedAt      = r.Status == CaseStatus.Submitted ? now.AddDays(-2) : null,
                CreatedAt        = now,
                UpdatedAt        = now
            };
            await db.Cases.AddAsync(sarCase);
            await db.SaveChangesAsync();

            // ── Outreach log history ───────────────────────────────────────────
            if (r.OutreachCount >= 1)
                await db.OutreachLogs.AddAsync(new OutreachLog
                {
                    CaseId = sarCase.Id, CountyId = 1,
                    Channel = OutreachChannel.Sms, Status = OutreachStatus.Delivered,
                    MessageTemplate = "sar7-reminder-60d",
                    MessageBody = $"Hi {r.First}, your SAR-7 is due {r.DueDate:MM/dd/yyyy}. Submit it to keep your CalFresh benefits.",
                    DaysBeforeDue = 60, SentAt = r.DueDate.AddDays(-60), DeliveredAt = r.DueDate.AddDays(-60).AddMinutes(2)
                });

            if (r.OutreachCount >= 2)
                await db.OutreachLogs.AddAsync(new OutreachLog
                {
                    CaseId = sarCase.Id, CountyId = 1,
                    Channel = OutreachChannel.Email, Status = OutreachStatus.Opened,
                    MessageTemplate = "sar7-reminder-30d",
                    MessageBody = $"Dear {r.First} {r.Last}, your SAR-7 is due {r.DueDate:MM/dd/yyyy}. Click the link to complete it online.",
                    DaysBeforeDue = 30, SentAt = r.DueDate.AddDays(-30), DeliveredAt = r.DueDate.AddDays(-30).AddMinutes(5)
                });

            if (r.OutreachCount >= 3)
                await db.OutreachLogs.AddAsync(new OutreachLog
                {
                    CaseId = sarCase.Id, CountyId = 1,
                    Channel = OutreachChannel.Sms, Status = OutreachStatus.Delivered,
                    MessageTemplate = "sar7-reminder-14d",
                    MessageBody = $"URGENT: {r.First}, your SAR-7 is due in 14 days on {r.DueDate:MM/dd/yyyy}. Submit now to avoid losing benefits.",
                    DaysBeforeDue = 14, SentAt = r.DueDate.AddDays(-14), DeliveredAt = r.DueDate.AddDays(-14).AddMinutes(1)
                });

            await db.SaveChangesAsync();
        }
    }
}
