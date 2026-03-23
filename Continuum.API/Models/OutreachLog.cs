namespace Continuum.API.Models;

public class OutreachLog
{
    public int Id { get; set; }
    public int CaseId { get; set; }
    public int CountyId { get; set; }
    public OutreachChannel Channel { get; set; }
    public OutreachStatus Status { get; set; } = OutreachStatus.Pending;
    public string MessageTemplate { get; set; } = string.Empty;
    public string? MessageBody { get; set; }
    public string? ExternalMessageId { get; set; }
    public int DaysBeforeDue { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeliveredAt { get; set; }
    public string? ErrorMessage { get; set; }

    public Case Case { get; set; } = null!;
    public County County { get; set; } = null!;
}
