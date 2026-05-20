using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Report.Domain.Entities;

namespace Report.Domain.Interfaces;

public interface IReportQueries
{
    Task<List<CourseSalesResult>> GetCourseSalesAsync(DateTime start, DateTime end, Guid? courseId, Guid? companyId = null, CancellationToken ct = default);
    Task<List<UserActivityResult>> GetUserActivityAsync(DateTime start, DateTime end, Guid? userId, Guid? companyId = null, CancellationToken ct = default);
    Task<List<CourseActivityResult>> GetCourseActivityAsync(DateTime start, DateTime end, Guid? companyId = null, CancellationToken ct = default);
}
