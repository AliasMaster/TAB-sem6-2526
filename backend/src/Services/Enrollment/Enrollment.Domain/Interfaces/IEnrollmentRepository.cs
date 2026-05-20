using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EnrollmentService.Domain.Entities;

namespace EnrollmentService.Domain.Interfaces;

public interface IEnrollmentRepository
{
    Task<Enrollment?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Enrollment?> GetByUserIdAndCourseIdAsync(Guid userId, Guid courseId, CancellationToken ct = default);
    Task AddAsync(Enrollment enrollment, CancellationToken ct = default);
    Task<bool> AnyActiveAsync(Guid userId, Guid courseId, CancellationToken ct = default);
    Task<List<Enrollment>> GetActiveByUserIdAsync(Guid userId, CancellationToken ct = default);
}
