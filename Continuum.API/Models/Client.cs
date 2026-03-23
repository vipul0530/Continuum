namespace Continuum.API.Models;

public class Client
{
    public int Id { get; set; }
    public int CountyId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string PreferredLanguage { get; set; } = "en";
    public string? CalSawsId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public County County { get; set; } = null!;
    public ICollection<Case> Cases { get; set; } = new List<Case>();

    public string FullName => $"{FirstName} {LastName}";
}
