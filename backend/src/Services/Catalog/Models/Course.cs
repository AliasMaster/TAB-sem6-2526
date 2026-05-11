namespace CatalogService.Models;

public class Course
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public Guid AuthorId { get; set; }
    public CourseStatus Status { get; set; } = CourseStatus.Inactive;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CourseMaterial> Materials { get; set; } = new List<CourseMaterial>();
}
