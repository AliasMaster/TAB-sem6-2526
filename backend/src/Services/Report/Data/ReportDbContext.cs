using Microsoft.EntityFrameworkCore;

namespace ReportService.Data;

public class ReportDbContext : DbContext
{
    public ReportDbContext(DbContextOptions<ReportDbContext> options) : base(options) { }

    public DbSet<CourseSaleRecord> CourseSales { get; set; }
    public DbSet<UserActivityRecord> UserActivities { get; set; }
}

public class CourseSaleRecord
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public Guid UserId { get; set; }
    public decimal Price { get; set; }
    public DateTime PurchasedAt { get; set; }
}

public class UserActivityRecord
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public ActivityType Type { get; set; }
    public DateTime ActivityDate { get; set; }
}

public enum ActivityType
{
    ForumPost,
    GuestBookEntry,
    MaterialDownload
}
