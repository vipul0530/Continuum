using Continuum.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Continuum.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<County> Counties => Set<County>();
    public DbSet<Case> Cases => Set<Case>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<OutreachLog> OutreachLogs => Set<OutreachLog>();
    public DbSet<SarSubmission> SarSubmissions => Set<SarSubmission>();
    public DbSet<Worker> Workers => Set<Worker>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── County ────────────────────────────────────────────────────────────
        modelBuilder.Entity<County>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.FipsCode).HasMaxLength(10);
            entity.HasIndex(e => e.FipsCode).IsUnique();
        });

        // ── Worker ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Worker>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).HasMaxLength(256).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Role).HasConversion<string>();
            entity.HasOne(e => e.County)
                  .WithMany(c => c.Workers)
                  .HasForeignKey(e => e.CountyId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Client ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(256);
            entity.Property(e => e.PreferredLanguage).HasMaxLength(5).HasDefaultValue("en");
            entity.Property(e => e.CalSawsId).HasMaxLength(50);
            entity.HasOne(e => e.County)
                  .WithMany()
                  .HasForeignKey(e => e.CountyId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Case ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<Case>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CaseNumber).HasMaxLength(50).IsRequired();
            entity.HasIndex(e => new { e.CountyId, e.CaseNumber }).IsUnique();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.UrgencyLevel).HasConversion<string>();
            entity.HasOne(e => e.County)
                  .WithMany(c => c.Cases)
                  .HasForeignKey(e => e.CountyId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Client)
                  .WithMany(c => c.Cases)
                  .HasForeignKey(e => e.ClientId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── OutreachLog ───────────────────────────────────────────────────────
        modelBuilder.Entity<OutreachLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Channel).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.MessageTemplate).HasMaxLength(100);
            entity.HasOne(e => e.Case)
                  .WithMany(c => c.OutreachLogs)
                  .HasForeignKey(e => e.CaseId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.County)
                  .WithMany()
                  .HasForeignKey(e => e.CountyId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── SarSubmission ─────────────────────────────────────────────────────
        modelBuilder.Entity<SarSubmission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).HasMaxLength(128).IsRequired();
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasOne(e => e.Case)
                  .WithOne(c => c.SarSubmission)
                  .HasForeignKey<SarSubmission>(e => e.CaseId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.County)
                  .WithMany()
                  .HasForeignKey(e => e.CountyId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Seed counties ─────────────────────────────────────────────────────
        modelBuilder.Entity<County>().HasData(
            new County { Id = 1, Name = "San Diego",        FipsCode = "06073", IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new County { Id = 2, Name = "Riverside",        FipsCode = "06065", IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new County { Id = 3, Name = "San Bernardino",   FipsCode = "06071", IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new County { Id = 4, Name = "Fresno",           FipsCode = "06019", IsActive = true, CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}
