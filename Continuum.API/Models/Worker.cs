namespace Continuum.API.Models;

public class Worker
{
    public int Id { get; set; }
    public int CountyId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public WorkerRole Role { get; set; } = WorkerRole.Worker;
    public string? PasswordHash { get; set; }
    public string? ExternalId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public County County { get; set; } = null!;

    public string FullName => $"{FirstName} {LastName}";
}
