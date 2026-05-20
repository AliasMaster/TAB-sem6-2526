using System;
using CatalogService.Domain.Enums;

namespace CatalogService.Application.DTOs;

public record CourseDto(
    Guid Id,
    string Title,
    string Description,
    decimal Price,
    string? ImageUrl,
    Guid AuthorId,
    CourseStatus Status,
    bool IsBlocked,
    DateTime CreatedAt,
    int ReviewCount = 0,
    double AverageRating = 0.0
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
