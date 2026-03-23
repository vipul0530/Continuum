namespace Continuum.API.Models;

public class Case
{
    public int Id { get; set; }
    public int CountyId { get; set; }
    public int ClientId { get; set; }
    public string CaseNumber { get; set; } = string.Empty;
    public DateTime SarDueDate { get; set; }
    public CaseStatus Status { get; set; } = CaseStatus.Active;
    public UrgencyLevel UrgencyLevel { get; set; } = UrgencyLevel.Green;
    public bool IsAtRisk { get; set; } = false;
    public int OutreachAttempts { get; set; } = 0;
    public DateTime? LastOutreachAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public County County { get; set; } = null!;
    public Client Client { get; set; } = null!;
    public ICollection<OutreachLog> OutreachLogs { get; set; } = new List<OutreachLog>();
    public SarSubmission? SarSubmission { get; set; }
}
