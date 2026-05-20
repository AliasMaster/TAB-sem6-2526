using System;

namespace Report.Domain.Entities;

public class UserActivityResult
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int TotalPosts { get; set; }
    public int TotalThreads { get; set; }
    public int TotalLessonAccesses { get; set; }
    public int CoursesEnrolled { get; set; }
}
