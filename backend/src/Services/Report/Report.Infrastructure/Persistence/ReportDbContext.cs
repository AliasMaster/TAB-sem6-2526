using Microsoft.EntityFrameworkCore;
using Report.Domain.Entities;

namespace Report.Infrastructure.Persistence;

public class ReportDbContext : DbContext
{
    public ReportDbContext(DbContextOptions<ReportDbContext> options) : base(options) { }

    public DbSet<CourseSalesResult> CourseSalesResults { get; set; } = null!;
    public DbSet<UserActivityResult> UserActivityResults { get; set; } = null!;
    public DbSet<CourseActivityResult> CourseActivityResults { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<CourseSalesResult>().HasNoKey();
        modelBuilder.Entity<UserActivityResult>().HasNoKey();
        modelBuilder.Entity<CourseActivityResult>().HasNoKey();
    }
}
