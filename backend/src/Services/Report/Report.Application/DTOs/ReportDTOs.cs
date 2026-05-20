namespace Report.Application.DTOs;

/// <summary>
/// Report 1 — Course Sales Summary (Zestawienie sprzedaży szkoleń w zadanym okresie).
/// </summary>
public record CourseSalesReportRow(
    Guid CourseId,
    string CourseTitle,
    int AccessesSold,
    decimal TotalRevenue
);

public record CourseSalesReport(
    DateOnly StartDate,
    DateOnly EndDate,
    IReadOnlyList<CourseSalesReportRow> Rows,
    int GrandTotalAccessesSold,
    decimal GrandTotalRevenue
);

/// <summary>
/// Report 2 — User Activity on the Platform (Aktywność użytkowników na platformie).
/// </summary>
public record UserActivityReportRow(
    Guid UserId,
    string Username,
    /// <summary>community.posts written in the period.</summary>
    int TotalForumPosts,
    /// <summary>community.threads started — treated as "guestbook entries".</summary>
    int TotalThreadsStarted,
    /// <summary>catalog.progress rows accessed — proxy for material downloads.</summary>
    int TotalLessonAccesses,
    /// <summary>Distinct active enrollments (all-time).</summary>
    int CoursesEnrolled
);

public record UserActivityReport(
    DateOnly StartDate,
    DateOnly EndDate,
    IReadOnlyList<UserActivityReportRow> Rows,
    int GrandTotalPosts,
    int GrandTotalThreads,
    int GrandTotalLessonAccesses
);

/// <summary>
/// Report 3 — Course Activity Report
/// </summary>
public record CourseActivityReportRow(
    Guid CourseId,
    string CourseTitle,
    int ActiveUsers,
    int ForumPosts,
    int MaterialDownloads
);

public record CourseActivityReport(
    DateOnly StartDate,
    DateOnly EndDate,
    IReadOnlyList<CourseActivityReportRow> Rows,
    int GrandTotalActiveUsers,
    int GrandTotalForumPosts,
    int GrandTotalMaterialDownloads
);
