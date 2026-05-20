using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Report.Domain.Entities;
using Report.Domain.Interfaces;

namespace Report.Infrastructure.Persistence;

public class ReportQueries : IReportQueries
{
    private readonly ReportDbContext _db;

    public ReportQueries(ReportDbContext db)
    {
        _db = db;
    }

    public async Task<List<CourseSalesResult>> GetCourseSalesAsync(DateTime start, DateTime end, Guid? courseId, Guid? companyId = null, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                c.id           AS "CourseId",
                c.title        AS "CourseTitle",
                COUNT(p.id)::int  AS "AccessesSold",
                COALESCE(SUM(p.amount), 0) AS "TotalRevenue"
            FROM orders.payments p
            JOIN catalog.courses c ON c.id = p.course_id
            WHERE p.status = 'completed'
              AND p.created_at >= {0}
              AND p.created_at <= {1}
              AND ({2}::uuid IS NULL OR p.course_id = {2}::uuid)
              AND ({3}::uuid IS NULL OR c.author_id = {3}::uuid)
            GROUP BY c.id, c.title
            ORDER BY "TotalRevenue" DESC
            """;

        var courseParam = courseId.HasValue ? courseId.Value.ToString() : (object)DBNull.Value;
        var companyParam = companyId.HasValue ? companyId.Value.ToString() : (object)DBNull.Value;
        return await _db.CourseSalesResults
            .FromSqlRaw(sql, start, end, courseParam, companyParam)
            .ToListAsync(ct);
    }

    public async Task<List<UserActivityResult>> GetUserActivityAsync(DateTime start, DateTime end, Guid? userId, Guid? companyId = null, CancellationToken ct = default)
    {
        var sql = """
            SELECT
                u.id                                      AS "UserId",
                u.login                                   AS "Username",
                COUNT(DISTINCT po.id)::int                AS "TotalPosts",
                COUNT(DISTINCT th.id)::int                AS "TotalThreads",
                COUNT(DISTINCT pr.id)::int                AS "TotalLessonAccesses",
                COUNT(DISTINCT e.course_id)::int          AS "CoursesEnrolled"
            FROM auth.users u
            LEFT JOIN community.posts po
                ON po.author_id = u.id
               AND po.created_at BETWEEN {0} AND {1}
            LEFT JOIN community.threads th
                ON th.author_id = u.id
               AND th.created_at BETWEEN {0} AND {1}
            LEFT JOIN (
                SELECT pr_inner.id, pr_inner.user_id, pr_inner.last_accessed
                FROM catalog.progress pr_inner
                JOIN catalog.lessons l ON l.id = pr_inner.lesson_id
                JOIN catalog.courses c ON c.id = l.course_id
                WHERE {3}::uuid IS NULL OR c.author_id = {3}::uuid
            ) pr
                ON pr.user_id = u.id
               AND pr.last_accessed BETWEEN {0} AND {1}
            LEFT JOIN enrollment.enrollments e
                ON e.user_id = u.id
               AND e.status = 'active'
               AND ({3}::uuid IS NULL OR e.course_id IN (SELECT id FROM catalog.courses WHERE author_id = {3}::uuid))
            WHERE ({2}::uuid IS NULL OR u.id = {2}::uuid)
              AND ({3}::uuid IS NULL OR u.id IN (
                  SELECT user_id FROM enrollment.enrollments e_sub
                  JOIN catalog.courses c_sub ON c_sub.id = e_sub.course_id
                  WHERE c_sub.author_id = {3}::uuid
              ))
            GROUP BY u.id, u.login
            HAVING
                COUNT(DISTINCT po.id) > 0
                OR COUNT(DISTINCT th.id) > 0
                OR COUNT(DISTINCT pr.id) > 0
            ORDER BY "TotalPosts" DESC, "TotalThreads" DESC
            """;

        var userParam = userId.HasValue ? userId.Value.ToString() : (object)DBNull.Value;
        var companyParam = companyId.HasValue ? companyId.Value.ToString() : (object)DBNull.Value;
        return await _db.UserActivityResults
            .FromSqlRaw(sql, start, end, userParam, companyParam)
            .ToListAsync(ct);
    }

    public async Task<List<CourseActivityResult>> GetCourseActivityAsync(DateTime start, DateTime end, Guid? companyId = null, CancellationToken ct = default)
    {
        var sql = """
            SELECT 
                c.id AS "CourseId", 
                c.title AS "CourseTitle",
                COUNT(DISTINCT pr.user_id)::int AS "ActiveUsers",
                COUNT(DISTINCT po.id)::int AS "ForumPosts",
                COUNT(DISTINCT pr.id)::int AS "MaterialDownloads"
            FROM catalog.courses c
            JOIN catalog.lessons l ON l.id = c.course_id
            LEFT JOIN catalog.progress pr ON pr.lesson_id = l.id AND pr.last_accessed BETWEEN {0} AND {1}
            LEFT JOIN community.posts po ON po.author_id = pr.user_id AND po.created_at BETWEEN {0} AND {1}
            WHERE ({2}::uuid IS NULL OR c.author_id = {2}::uuid)
            GROUP BY c.id, c.title
            ORDER BY "ActiveUsers" DESC, "MaterialDownloads" DESC
            """;

        // Wait, the SQL above has `l.id = c.course_id` which is wrong. It should be `l.course_id = c.id`.
        // Also if we left join `community.posts` on `pr.user_id`, we will get duplicate counts if a user has multiple progress records in the same course.
        // A better approach is to use subqueries or CTE. Let's fix the SQL.

        var sqlFixed = """
            SELECT 
                c.id AS "CourseId", 
                c.title AS "CourseTitle",
                (
                    SELECT COUNT(DISTINCT pr.user_id)::int 
                    FROM catalog.progress pr 
                    JOIN catalog.lessons l ON l.id = pr.lesson_id 
                    WHERE l.course_id = c.id AND pr.last_accessed BETWEEN {0} AND {1}
                ) AS "ActiveUsers",
                (
                    SELECT COUNT(po.id)::int 
                    FROM community.posts po 
                    WHERE po.created_at BETWEEN {0} AND {1}
                      AND po.author_id IN (
                          SELECT DISTINCT pr.user_id 
                          FROM catalog.progress pr 
                          JOIN catalog.lessons l ON l.id = pr.lesson_id 
                          WHERE l.course_id = c.id AND pr.last_accessed BETWEEN {0} AND {1}
                      )
                ) AS "ForumPosts",
                (
                    SELECT COUNT(pr.id)::int 
                    FROM catalog.progress pr 
                    JOIN catalog.lessons l ON l.id = pr.lesson_id 
                    WHERE l.course_id = c.id AND pr.last_accessed BETWEEN {0} AND {1}
                ) AS "MaterialDownloads"
            FROM catalog.courses c
            WHERE ({2}::uuid IS NULL OR c.author_id = {2}::uuid)
            ORDER BY "ActiveUsers" DESC, "MaterialDownloads" DESC
            """;

        var companyParam = companyId.HasValue ? companyId.Value.ToString() : (object)DBNull.Value;
        return await _db.CourseActivityResults
            .FromSqlRaw(sqlFixed, start, end, companyParam)
            .ToListAsync(ct);
    }
}
