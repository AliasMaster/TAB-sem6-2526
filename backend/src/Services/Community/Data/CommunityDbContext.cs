using Microsoft.EntityFrameworkCore;

namespace CommunityService.Data;

public class CommunityDbContext : DbContext
{
    public CommunityDbContext(DbContextOptions<CommunityDbContext> options) : base(options) { }

    public DbSet<ForumPost> ForumPosts { get; set; }
    public DbSet<GuestBookEntry> GuestBookEntries { get; set; }
}

public class ForumPost
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class GuestBookEntry
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
