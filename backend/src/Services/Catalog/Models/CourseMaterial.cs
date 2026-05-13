namespace CatalogService.Models;

public class CourseMaterial
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ContentUrl { get; set; } = string.Empty;
    public int Order { get; set; }

    public Course? Course { get; set; }
}
