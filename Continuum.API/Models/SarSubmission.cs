namespace Continuum.API.Models;

public class SarSubmission
{
    public int Id { get; set; }
    public int CaseId { get; set; }
    public int CountyId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime TokenExpiry { get; set; }
    public bool IsSubmitted { get; set; } = false;
    public DateTime? SubmittedAt { get; set; }
    public string? FormDataJson { get; set; }
    public string? DocumentPathsJson { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Case Case { get; set; } = null!;
    public County County { get; set; } = null!;
}
