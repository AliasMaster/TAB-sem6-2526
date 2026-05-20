using System;

namespace CommunityService.Domain.Entities;

public class Post
{
    public Guid Id { get; set; }
    public Guid ThreadId { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid AuthorId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Thread? Thread { get; set; }
}
