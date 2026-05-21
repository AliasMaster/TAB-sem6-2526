using System;
using System.Collections.Generic;
using CatalogService.Domain.Enums;

namespace CatalogService.Domain.Entities;

public class Course
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public Guid AuthorId { get; set; }
    public CourseStatus Status { get; set; } = CourseStatus.Active;
    public bool IsBlocked { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CourseMaterial> Materials { get; set; } = new List<CourseMaterial>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
