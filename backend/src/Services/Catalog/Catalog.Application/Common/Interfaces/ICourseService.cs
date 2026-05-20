using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CatalogService.Application.DTOs;

namespace CatalogService.Application.Common.Interfaces;

public interface ICourseService
{
    Task<List<CourseDto>> GetAllCoursesAsync(string? role, CancellationToken ct = default);
    Task<CourseDto?> GetCourseByIdAsync(Guid id, string? role, CancellationToken ct = default);
    Task<CourseDto> CreateCourseAsync(CreateCourseRequest request, Guid authorId, CancellationToken ct = default);
    Task<bool?> UpdateCourseAsync(Guid id, UpdateCourseRequest request, string? role, string? userIdStr, CancellationToken ct = default);
    Task<bool?> DeleteCourseAsync(Guid id, string? role, string? userIdStr, CancellationToken ct = default);
    Task<List<CourseMaterialDto>?> GetMaterialsAsync(Guid courseId, string? role, string? userIdStr, CancellationToken ct = default);
    Task<CourseMaterialDto?> AddMaterialAsync(Guid courseId, CreateCourseMaterialRequest request, string? role, string? userIdStr, CancellationToken ct = default);
    Task<bool?> UpdateMaterialAsync(Guid courseId, Guid materialId, UpdateCourseMaterialRequest request, string? role, string? userIdStr, CancellationToken ct = default);
    Task<bool?> DeleteMaterialAsync(Guid courseId, Guid materialId, string? role, string? userIdStr, CancellationToken ct = default);
    Task<bool> BlockCourseAsync(Guid id, bool isBlocked, CancellationToken ct = default);
    Task<bool> GrantAccessAsync(Guid courseId, Guid userId, CancellationToken ct = default);
    Task<bool> RevokeAccessAsync(Guid courseId, Guid userId, CancellationToken ct = default);
    Task<string?> VerifyAccessAsync(Guid courseId, Guid lessonId, string? role, string? userIdStr, CancellationToken ct = default);
}
