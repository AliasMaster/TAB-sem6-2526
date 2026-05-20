namespace CatalogService.Application.DTOs;

public class UpdateCourseMaterialRequest
{
    public string Title { get; set; } = string.Empty;
    public string ContentUrl { get; set; } = string.Empty;
    public int Order { get; set; }
}
