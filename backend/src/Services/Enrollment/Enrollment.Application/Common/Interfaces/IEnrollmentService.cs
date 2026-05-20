using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EnrollmentService.Domain.Entities;

namespace EnrollmentService.Application.Common.Interfaces;

public interface IEnrollmentService
{
    Task<List<Domain.Entities.Enrollment>> GetMyActiveEnrollmentsAsync(Guid userId, CancellationToken ct = default);
    Task<bool> HasAccessToCourseAsync(Guid userId, Guid courseId, string? role, CancellationToken ct = default);
    Task PurchaseCourseAsync(Guid userId, Guid courseId, CancellationToken ct = default);
    Task RefundCourseAsync(Guid userId, Guid courseId, CancellationToken ct = default);
}
