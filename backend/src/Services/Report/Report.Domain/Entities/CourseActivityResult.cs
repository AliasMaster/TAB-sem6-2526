using System;

namespace Report.Domain.Entities;

public class CourseActivityResult
{
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public int ActiveUsers { get; set; }
    public int ForumPosts { get; set; }
    public int MaterialDownloads { get; set; }
}
