using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EnrollmentService.Application.Common.Interfaces;
using EnrollmentService.Domain.Entities;
using EnrollmentService.Domain.Enums;
using EnrollmentService.Domain.Interfaces;

namespace EnrollmentService.Application.Services;

public class EnrollmentService : IEnrollmentService
{
    private readonly IEnrollmentRepository _enrollmentRepository;
    private readonly IUnitOfWork _unitOfWork;

    public EnrollmentService(IEnrollmentRepository enrollmentRepository, IUnitOfWork unitOfWork)
    {
        _enrollmentRepository = enrollmentRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<Domain.Entities.Enrollment>> GetMyActiveEnrollmentsAsync(Guid userId, CancellationToken ct = default)
    {
        return await _enrollmentRepository.GetActiveByUserIdAsync(userId, ct);
    }

    public async Task<bool> HasAccessToCourseAsync(Guid userId, Guid courseId, string? role, CancellationToken ct = default)
    {
        bool isAdmin = string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase);
        if (isAdmin)
        {
            return true;
        }

        return await _enrollmentRepository.AnyActiveAsync(userId, courseId, ct);
    }

    public async Task PurchaseCourseAsync(Guid userId, Guid courseId, CancellationToken ct = default)
    {
        var existing = await _enrollmentRepository.GetByUserIdAndCourseIdAsync(userId, courseId, ct);

        if (existing == null)
        {
            var enrollment = new Domain.Entities.Enrollment
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CourseId = courseId,
                Status = EnrollmentStatus.Active,
                EnrolledAt = DateTime.UtcNow
            };
            await _enrollmentRepository.AddAsync(enrollment, ct);
        }
        else
        {
            existing.Status = EnrollmentStatus.Active;
        }

        await _unitOfWork.SaveChangesAsync(ct);
    }

    public async Task RefundCourseAsync(Guid userId, Guid courseId, CancellationToken ct = default)
    {
        var existing = await _enrollmentRepository.GetByUserIdAndCourseIdAsync(userId, courseId, ct);

        if (existing != null)
        {
            existing.Status = EnrollmentStatus.Revoked;
            await _unitOfWork.SaveChangesAsync(ct);
        }
    }
}
