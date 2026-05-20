using System;
using System.Collections.Generic;

namespace CommunityService.Domain.Entities;

public class Thread
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public Guid AuthorId { get; set; }
    public CommunityService.Domain.Enums.ThreadCategory Category { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Post> Posts { get; set; } = new List<Post>();
}
