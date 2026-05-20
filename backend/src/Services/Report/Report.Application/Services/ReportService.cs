using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Report.Application.Common.Interfaces;
using Report.Application.DTOs;
using Report.Domain.Interfaces;

namespace Report.Application.Services;

public class ReportService : IReportService
{
    private readonly IReportQueries _reportQueries;

    public ReportService(IReportQueries reportQueries)
    {
        _reportQueries = reportQueries;
    }

    public async Task<CourseSalesReport> GetCourseSalesAsync(DateOnly startDate, DateOnly endDate, Guid? courseId, Guid? companyId = null, CancellationToken ct = default)
    {
        var start = startDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var end = endDate.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);

        var results = await _reportQueries.GetCourseSalesAsync(start, end, courseId, companyId, ct);

        var rows = results
            .Select(r => new CourseSalesReportRow(r.CourseId, r.CourseTitle, r.AccessesSold, r.TotalRevenue))
            .ToList();

        return new CourseSalesReport(
            StartDate: startDate,
            EndDate: endDate,
            Rows: rows,
            GrandTotalAccessesSold: rows.Sum(r => r.AccessesSold),
            GrandTotalRevenue: rows.Sum(r => r.TotalRevenue)
        );
    }

    public async Task<UserActivityReport> GetUserActivityAsync(DateOnly startDate, DateOnly endDate, Guid? userId, Guid? companyId = null, CancellationToken ct = default)
    {
        var start = startDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var end = endDate.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);

        var results = await _reportQueries.GetUserActivityAsync(start, end, userId, companyId, ct);

        var rows = results
            .Select(r => new UserActivityReportRow(
                companyId.HasValue ? Guid.Empty : r.UserId,
                companyId.HasValue ? "Anonymous User" : r.Username,
                r.TotalPosts,
                r.TotalThreads,
                r.TotalLessonAccesses,
                r.CoursesEnrolled))
            .ToList();

        return new UserActivityReport(
            StartDate: startDate,
            EndDate: endDate,
            Rows: rows,
            GrandTotalPosts: rows.Sum(r => r.TotalForumPosts),
            GrandTotalThreads: rows.Sum(r => r.TotalThreadsStarted),
            GrandTotalLessonAccesses: rows.Sum(r => r.TotalLessonAccesses)
        );
    }

    public async Task<CourseActivityReport> GetCourseActivityAsync(DateOnly startDate, DateOnly endDate, Guid? companyId = null, CancellationToken ct = default)
    {
        var start = startDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var end = endDate.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);

        var results = await _reportQueries.GetCourseActivityAsync(start, end, companyId, ct);

        var rows = results
            .Select(r => new CourseActivityReportRow(
                r.CourseId,
                r.CourseTitle,
                r.ActiveUsers,
                r.ForumPosts,
                r.MaterialDownloads))
            .ToList();

        return new CourseActivityReport(
            StartDate: startDate,
            EndDate: endDate,
            Rows: rows,
            GrandTotalActiveUsers: rows.Sum(r => r.ActiveUsers),
            GrandTotalForumPosts: rows.Sum(r => r.ForumPosts),
            GrandTotalMaterialDownloads: rows.Sum(r => r.MaterialDownloads)
        );
    }
}
