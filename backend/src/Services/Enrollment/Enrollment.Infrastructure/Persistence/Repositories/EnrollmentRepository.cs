using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EnrollmentService.Domain.Entities;
using EnrollmentService.Domain.Enums;
using EnrollmentService.Domain.Interfaces;

namespace EnrollmentService.Infrastructure.Persistence.Repositories;

public class EnrollmentRepository : IEnrollmentRepository
{
    private readonly EnrollmentDbContext _db;

    public EnrollmentRepository(EnrollmentDbContext db)
    {
        _db = db;
    }

    public async Task<Domain.Entities.Enrollment?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _db.Enrollments.FindAsync(new object[] { id }, ct);
    }

    public async Task<Domain.Entities.Enrollment?> GetByUserIdAndCourseIdAsync(Guid userId, Guid courseId, CancellationToken ct = default)
    {
        return await _db.Enrollments
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId, ct);
    }

    public async Task AddAsync(Domain.Entities.Enrollment enrollment, CancellationToken ct = default)
    {
        await _db.Enrollments.AddAsync(enrollment, ct);
    }

    public async Task<bool> AnyActiveAsync(Guid userId, Guid courseId, CancellationToken ct = default)
    {
        return await _db.Enrollments
            .AnyAsync(e => e.UserId == userId && e.CourseId == courseId && e.Status == EnrollmentStatus.Active, ct);
    }

    public async Task<List<Domain.Entities.Enrollment>> GetActiveByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        return await _db.Enrollments
            .Where(e => e.UserId == userId && e.Status == EnrollmentStatus.Active)
            .ToListAsync(ct);
    }
}
