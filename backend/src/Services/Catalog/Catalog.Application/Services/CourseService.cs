using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CatalogService.Application.Common.Interfaces;
using CatalogService.Application.DTOs;
using CatalogService.Domain.Entities;
using CatalogService.Domain.Enums;
using CatalogService.Domain.Interfaces;

namespace CatalogService.Application.Services;

public class CourseService : ICourseService
{
    private readonly ICourseRepository _courseRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CourseService(ICourseRepository courseRepository, IUnitOfWork unitOfWork)
    {
        _courseRepository = courseRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CourseDto>> GetAllCoursesAsync(string? role, CancellationToken ct = default)
    {
        var filter = (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) || string.Equals(role, "Company", StringComparison.OrdinalIgnoreCase)) ? (CourseStatus?)null : CourseStatus.Active;
        var courses = await _courseRepository.GetAllAsync(filter, ct);

        if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) && !string.Equals(role, "Company", StringComparison.OrdinalIgnoreCase))
        {
            courses = courses.Where(c => !c.IsBlocked).ToList();
        }

        return courses
            .Select(c => new CourseDto(
                c.Id, c.Title, c.Description, c.Price, c.ImageUrl, c.AuthorId, c.Status, c.IsBlocked, c.CreatedAt,
                c.Reviews.Count,
                c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0.0
            ))
            .ToList();
    }

    public async Task<CourseDto?> GetCourseByIdAsync(Guid id, string? role, CancellationToken ct = default)
    {
        var course = await _courseRepository.GetByIdAsync(id, ct);
        if (course == null) return null;

        if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            if (course.Status != CourseStatus.Active || course.IsBlocked)
            {
                return null;
            }
        }

        return new CourseDto(
            course.Id, course.Title, course.Description, course.Price, course.ImageUrl, course.AuthorId, course.Status, course.IsBlocked, course.CreatedAt,
            course.Reviews.Count,
            course.Reviews.Any() ? course.Reviews.Average(r => r.Rating) : 0.0
        );
    }

    public async Task<CourseDto> CreateCourseAsync(CreateCourseRequest request, Guid authorId, CancellationToken ct = default)
    {
        var course = new Course
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Price = request.Price,
            ImageUrl = request.ImageUrl,
            AuthorId = authorId,
            Status = request.Status,
            IsBlocked = false,
            CreatedAt = DateTime.UtcNow
        };

        await _courseRepository.AddAsync(course, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return new CourseDto(course.Id, course.Title, course.Description, course.Price, course.ImageUrl, course.AuthorId, course.Status, course.IsBlocked, course.CreatedAt, 0, 0.0);
    }

    public async Task<bool?> UpdateCourseAsync(Guid id, UpdateCourseRequest request, string? role, string? userIdStr, CancellationToken ct = default)
    {
        var course = await _courseRepository.GetByIdAsync(id, ct);
        if (course == null) return null; // NotFound

        if (!HasEditAccess(role, userIdStr, course.AuthorId))
        {
            return false; // Forbidden
        }

        course.Title = request.Title;
        course.Description = request.Description;
        course.Price = request.Price;
        course.ImageUrl = request.ImageUrl;
        course.Status = request.Status;

        await _unitOfWork.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool?> DeleteCourseAsync(Guid id, string? role, string? userIdStr, CancellationToken ct = default)
    {
        var course = await _courseRepository.GetByIdAsync(id, ct);
        if (course == null) return null; // NotFound

        if (!HasEditAccess(role, userIdStr, course.AuthorId))
        {
            return false; // Forbidden
        }

        _courseRepository.Remove(course);
        await _unitOfWork.SaveChangesAsync(ct);
        return true;
    }

    public async Task<List<CourseMaterialDto>?> GetMaterialsAsync(Guid courseId, string? role, string? userIdStr, CancellationToken ct = default)
    {
        var course = await _courseRepository.GetWithMaterialsByIdAsync(courseId, ct);
        if (course == null) return null;

        if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            if (course.Status != CourseStatus.Active || course.IsBlocked)
            {
                if (!HasEditAccess(role, userIdStr, course.AuthorId))
                {
                    return null; // Not found (or access denied)
                }
            }
        }

        return course.Materials
            .OrderBy(m => m.Order)
            .Select(m => new CourseMaterialDto(m.Id, m.Title, m.ContentUrl, m.Order))
            .ToList();
    }

    public async Task<CourseMaterialDto?> AddMaterialAsync(Guid courseId, CreateCourseMaterialRequest request, string? role, string? userIdStr, CancellationToken ct = default)
    {
        var course = await _courseRepository.GetByIdAsync(courseId, ct);
        if (course == null) return null;

        if (!HasEditAccess(role, userIdStr, course.AuthorId))
        {
            return null; // Forbidden / NotFound depending on perspective
        }

        var material = new CourseMaterial
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            Title = request.Title,
            ContentUrl = request.ContentUrl,
            Order = request.Order
        };

        await _courseRepository.AddMaterialAsync(material, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return new CourseMaterialDto(material.Id, material.Title, material.ContentUrl, material.Order);
    }

    public async Task<bool?> UpdateMaterialAsync(Guid courseId, Guid materialId, UpdateCourseMaterialRequest request, string? role, string? userIdStr, CancellationToken ct = default)
    {
        var course = await _courseRepository.GetByIdAsync(courseId, ct);
        if (course == null) return null;

        if (!HasEditAccess(role, userIdStr, course.AuthorId))
        {
            return false;
        }

        var material = await _courseRepository.GetMaterialByIdAsync(materialId, ct);
        if (material == null || material.CourseId != courseId) return null;

        material.Title = request.Title;
        material.ContentUrl = request.ContentUrl;
        material.Order = request.Order;

        await _unitOfWork.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool?> DeleteMaterialAsync(Guid courseId, Guid materialId, string? role, string? userIdStr, CancellationToken ct = default)
    {
        var course = await _courseRepository.GetByIdAsync(courseId, ct);
        if (course == null) return null;

        if (!HasEditAccess(role, userIdStr, course.AuthorId))
        {
            return false;
        }

        var material = await _courseRepository.GetMaterialByIdAsync(materialId, ct);
        if (material == null || material.CourseId != courseId) return null;

        _courseRepository.RemoveMaterial(material);
        await _unitOfWork.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> BlockCourseAsync(Guid id, bool isBlocked, CancellationToken ct = default)
    {
        var course = await _courseRepository.GetByIdAsync(id, ct);
        if (course == null) return false;

        course.IsBlocked = isBlocked;
        await _unitOfWork.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> GrantAccessAsync(Guid courseId, Guid userId, CancellationToken ct = default)
    {
        var course = await _courseRepository.GetByIdAsync(courseId, ct);
        if (course == null) return false;

        var existingAccess = await _courseRepository.GetAccessAsync(courseId, userId, ct);
        if (existingAccess == null)
        {
            var access = new CourseAccess
            {
                CourseId = courseId,
                UserId = userId,
                GrantedAt = DateTime.UtcNow
            };
            await _courseRepository.AddAccessAsync(access, ct);
            await _unitOfWork.SaveChangesAsync(ct);
        }

        return true;
    }

    public async Task<bool> RevokeAccessAsync(Guid courseId, Guid userId, CancellationToken ct = default)
    {
        var access = await _courseRepository.GetAccessAsync(courseId, userId, ct);
        if (access == null) return false;

        _courseRepository.RemoveAccess(access);
        await _unitOfWork.SaveChangesAsync(ct);
        return true;
    }

    public async Task<string?> VerifyAccessAsync(Guid courseId, Guid lessonId, string? role, string? userIdStr, CancellationToken ct = default)
    {
        var course = await _courseRepository.GetByIdAsync(courseId, ct);
        if (course == null) return null;

        var lesson = await _courseRepository.GetMaterialByIdAsync(lessonId, ct);
        if (lesson == null || lesson.CourseId != courseId) return null;

        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase)) return lesson.ContentUrl;

        if (string.Equals(role, "Company", StringComparison.OrdinalIgnoreCase) && Guid.TryParse(userIdStr, out var compId) && compId == course.AuthorId)
        {
            return lesson.ContentUrl;
        }

        if (Guid.TryParse(userIdStr, out var userId))
        {
            var access = await _courseRepository.GetAccessAsync(courseId, userId, ct);
            if (access != null)
            {
                return lesson.ContentUrl;
            }
        }

        return null;
    }

    private static bool HasEditAccess(string? role, string? userIdStr, Guid authorId)
    {
        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase)) return true;

        if (string.Equals(role, "Company", StringComparison.OrdinalIgnoreCase) && Guid.TryParse(userIdStr, out var userId) && userId == authorId)
        {
            return true;
        }

        return false;
    }
}
