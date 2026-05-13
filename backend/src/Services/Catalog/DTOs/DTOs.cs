using CatalogService.Models;

namespace CatalogService.DTOs;

public record CourseDto(
    Guid Id,
    string Title,
    string Description,
    decimal Price,
    string? ImageUrl,
    Guid AuthorId,
    CourseStatus Status,
    DateTime CreatedAt
);

public record CourseMaterialDto(
    Guid Id,
    string Title,
    string ContentUrl,
    int Order
);

public record CreateCourseRequest(
    string Title,
    string Description,
    decimal Price,
    string? ImageUrl,
    CourseStatus Status = CourseStatus.Active
);

public record UpdateCourseRequest(
    string Title,
    string Description,
    decimal Price,
    string? ImageUrl,
    CourseStatus Status
);

public record CreateCourseMaterialRequest(
    string Title,
    string ContentUrl,
    int Order
);

public record GrantAccessRequest(
    Guid UserId
);
