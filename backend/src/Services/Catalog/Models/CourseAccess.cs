namespace CatalogService.Models;

public class CourseAccess
{
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;

    public Course? Course { get; set; }
}
