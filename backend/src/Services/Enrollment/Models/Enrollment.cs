namespace EnrollmentService.Models;

public enum EnrollmentStatus
{
    Active,
    Revoked
}

public class Enrollment
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
    public EnrollmentStatus Status { get; set; }
    public DateTime EnrolledAt { get; set; }
}
