using System;
using EnrollmentService.Domain.Enums;

namespace EnrollmentService.Domain.Entities;

public class Enrollment
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
    public EnrollmentStatus Status { get; set; }
    public DateTime EnrolledAt { get; set; }
}
