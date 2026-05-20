using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CatalogService.Domain.Entities;
using CatalogService.Domain.Enums;

namespace CatalogService.Domain.Interfaces;

public interface ICourseRepository
{
    Task<List<Course>> GetAllAsync(CourseStatus? statusFilter = null, CancellationToken ct = default);
    Task<Course?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Course?> GetWithMaterialsByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Course course, CancellationToken ct = default);
    void Remove(Course course);
    
    Task AddMaterialAsync(CourseMaterial material, CancellationToken ct = default);
    void RemoveMaterial(CourseMaterial material);
    Task<CourseAccess?> GetAccessAsync(Guid courseId, Guid userId, CancellationToken ct = default);
    Task<CourseMaterial?> GetMaterialByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAccessAsync(CourseAccess access, CancellationToken ct = default);
    void RemoveAccess(CourseAccess access);
}
