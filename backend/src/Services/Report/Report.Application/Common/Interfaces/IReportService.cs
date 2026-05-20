using Report.Application.DTOs;

namespace Report.Application.Common.Interfaces;

public interface IReportService
{
    Task<CourseSalesReport> GetCourseSalesAsync(DateOnly startDate, DateOnly endDate, Guid? courseId, Guid? companyId = null, CancellationToken ct = default);
    Task<UserActivityReport> GetUserActivityAsync(DateOnly startDate, DateOnly endDate, Guid? userId, Guid? companyId = null, CancellationToken ct = default);
    Task<CourseActivityReport> GetCourseActivityAsync(DateOnly startDate, DateOnly endDate, Guid? companyId = null, CancellationToken ct = default);
}
