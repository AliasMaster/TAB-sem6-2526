using System;

namespace EnrollmentService.Domain.Entities;

public class Progress
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid LessonId { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime LastAccessed { get; set; } = DateTime.UtcNow;
}
