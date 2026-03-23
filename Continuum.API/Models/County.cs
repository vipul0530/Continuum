namespace Continuum.API.Models;

public class County
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FipsCode { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Worker> Workers { get; set; } = new List<Worker>();
    public ICollection<Case> Cases { get; set; } = new List<Case>();
}
