using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CatalogService.Domain.Entities;
using CatalogService.Domain.Enums;
using CatalogService.Domain.Interfaces;

namespace CatalogService.Infrastructure.Persistence.Repositories;

public class CourseRepository : ICourseRepository
{
    private readonly CatalogDbContext _db;

    public CourseRepository(CatalogDbContext db)
    {
        _db = db;
    }

    public async Task<List<Course>> GetAllAsync(CourseStatus? statusFilter = null, CancellationToken ct = default)
    {
        var query = _db.Courses.Include(c => c.Reviews).AsQueryable();
        if (statusFilter.HasValue)
        {
            query = query.Where(c => c.Status == statusFilter.Value);
        }

        return await query.ToListAsync(ct);
    }

    public async Task<Course?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _db.Courses
            .Include(c => c.Reviews)
            .FirstOrDefaultAsync(c => c.Id == id, ct);
    }

    public async Task<Course?> GetWithMaterialsByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _db.Courses
            .Include(c => c.Materials)
            .FirstOrDefaultAsync(c => c.Id == id, ct);
    }

    public async Task AddAsync(Course course, CancellationToken ct = default)
    {
        await _db.Courses.AddAsync(course, ct);
    }

    public void Remove(Course course)
    {
        _db.Courses.Remove(course);
    }

    public async Task AddMaterialAsync(CourseMaterial material, CancellationToken ct = default)
    {
        await _db.CourseMaterials.AddAsync(material, ct);
    }

    public void RemoveMaterial(CourseMaterial material)
    {
        _db.CourseMaterials.Remove(material);
    }

    public async Task<CourseAccess?> GetAccessAsync(Guid courseId, Guid userId, CancellationToken ct = default)
    {
        return await _db.CourseAccesses
            .FirstOrDefaultAsync(ca => ca.CourseId == courseId && ca.UserId == userId, ct);
    }

    public async Task<CourseMaterial?> GetMaterialByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _db.CourseMaterials.FindAsync(new object[] { id }, ct);
    }

    public async Task AddAccessAsync(CourseAccess access, CancellationToken ct = default)
    {
        await _db.CourseAccesses.AddAsync(access, ct);
    }

    public void RemoveAccess(CourseAccess access)
    {
        _db.CourseAccesses.Remove(access);
    }
}
