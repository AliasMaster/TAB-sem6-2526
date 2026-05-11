using CatalogService.Data;
using CatalogService.DTOs;
using CatalogService.Models;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Endpoints;

public static class CourseEndpoints
{
    public static void MapCourseEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/courses");

        // 1. Get all courses (Public)
        group.MapGet("/", async (HttpContext context, CatalogDbContext db) =>
        {
            var role = context.Request.Headers["X-User-Role"].FirstOrDefault();
            
            var query = db.Courses.AsQueryable();
            
            if (role != "Admin")
            {
                query = query.Where(c => c.Status == CourseStatus.Active);
            }

            var courses = await query
                .Select(c => new CourseDto(c.Id, c.Title, c.Description, c.Price, c.ImageUrl, c.AuthorId, c.Status, c.CreatedAt))
                .ToListAsync();
            
            return Results.Ok(courses);
        });

        // 2. Get course by id (Public)
        group.MapGet("/{id:guid}", async (Guid id, HttpContext context, CatalogDbContext db) =>
        {
            var role = context.Request.Headers["X-User-Role"].FirstOrDefault();
            
            var course = await db.Courses.FindAsync(id);
            if (course is null) return Results.NotFound();

            if (course.Status != CourseStatus.Active && role != "Admin")
            {
                return Results.NotFound();
            }

            return Results.Ok(new CourseDto(course.Id, course.Title, course.Description, course.Price, course.ImageUrl, course.AuthorId, course.Status, course.CreatedAt));
        });

        // 3. Create course (Company or Admin)
        group.MapPost("/", async (CreateCourseRequest request, HttpContext context, CatalogDbContext db) =>
        {
            var role = context.Request.Headers["X-User-Role"].FirstOrDefault();
            var userIdStr = context.Request.Headers["X-User-Id"].FirstOrDefault();

            if (role != "Admin" && role != "Company")
            {
                return Results.StatusCode(403);
            }

            if (!Guid.TryParse(userIdStr, out var userId))
            {
                return Results.Unauthorized();
            }

            var course = new Course
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                Price = request.Price,
                ImageUrl = request.ImageUrl,
                AuthorId = userId,
                Status = request.Status,
                CreatedAt = DateTime.UtcNow
            };

            db.Courses.Add(course);
            await db.SaveChangesAsync();

            return Results.Created($"/api/catalog/courses/{course.Id}", 
                new CourseDto(course.Id, course.Title, course.Description, course.Price, course.ImageUrl, course.AuthorId, course.Status, course.CreatedAt));
        });

        // 4. Update course (Admin or Company who is the Author)
        group.MapPut("/{id:guid}", async (Guid id, UpdateCourseRequest request, HttpContext context, CatalogDbContext db) =>
        {
            var role = context.Request.Headers["X-User-Role"].FirstOrDefault();
            var userIdStr = context.Request.Headers["X-User-Id"].FirstOrDefault();

            var course = await db.Courses.FindAsync(id);
            if (course is null) return Results.NotFound();

            if (!HasEditAccess(role, userIdStr, course.AuthorId))
            {
                return Results.StatusCode(403);
            }

            course.Title = request.Title;
            course.Description = request.Description;
            course.Price = request.Price;
            course.ImageUrl = request.ImageUrl;
            course.Status = request.Status;

            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        // 5. Delete course (Admin or Company who is the Author)
        group.MapDelete("/{id:guid}", async (Guid id, HttpContext context, CatalogDbContext db) =>
        {
            var role = context.Request.Headers["X-User-Role"].FirstOrDefault();
            var userIdStr = context.Request.Headers["X-User-Id"].FirstOrDefault();

            var course = await db.Courses.FindAsync(id);
            if (course is null) return Results.NotFound();

            if (!HasEditAccess(role, userIdStr, course.AuthorId))
            {
                return Results.StatusCode(403);
            }

            db.Courses.Remove(course);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        // 6. Get course materials (Requires Access)
        group.MapGet("/{id:guid}/materials", async (Guid id, HttpContext context, CatalogDbContext db) =>
        {
            var role = context.Request.Headers["X-User-Role"].FirstOrDefault();
            var userIdStr = context.Request.Headers["X-User-Id"].FirstOrDefault();

            var course = await db.Courses.Include(c => c.Materials).FirstOrDefaultAsync(c => c.Id == id);
            if (course is null) return Results.NotFound();
            
            if (course.Status != CourseStatus.Active && role != "Admin" && !HasEditAccess(role, userIdStr, course.AuthorId))
            {
                return Results.NotFound(); // Cannot view materials if inactive unless Admin/Author
            }

            // For simplicity and to allow internal calls from EnrollmentService,
            // we will return materials if the course is active. 
            // In a production app, we would use a more robust internal auth or API Key.
            if (course.Status != CourseStatus.Active && role != "Admin" && !HasEditAccess(role, userIdStr, course.AuthorId))
            {
                return Results.NotFound();
            }

            var materials = course.Materials
                .OrderBy(m => m.Order)
                .Select(m => new CourseMaterialDto(m.Id, m.Title, m.ContentUrl, m.Order))
                .ToList();

            return Results.Ok(materials);
        });

        // 7. Add course material (Admin or Company who is the Author)
        group.MapPost("/{id:guid}/materials", async (Guid id, CreateCourseMaterialRequest request, HttpContext context, CatalogDbContext db) =>
        {
            var role = context.Request.Headers["X-User-Role"].FirstOrDefault();
            var userIdStr = context.Request.Headers["X-User-Id"].FirstOrDefault();

            var course = await db.Courses.FindAsync(id);
            if (course is null) return Results.NotFound();

            if (!HasEditAccess(role, userIdStr, course.AuthorId))
            {
                return Results.StatusCode(403);
            }

            var material = new CourseMaterial
            {
                Id = Guid.NewGuid(),
                CourseId = id,
                Title = request.Title,
                ContentUrl = request.ContentUrl,
                Order = request.Order
            };

            db.CourseMaterials.Add(material);
            await db.SaveChangesAsync();

            return Results.Created($"/api/catalog/courses/{id}/materials", 
                new CourseMaterialDto(material.Id, material.Title, material.ContentUrl, material.Order));
        });

        // 8. Grant access to user (Internal Endpoint for Enrollment Service)
        group.MapPost("/{id:guid}/access", async (Guid id, GrantAccessRequest request, CatalogDbContext db) =>
        {
            var course = await db.Courses.FindAsync(id);
            if (course is null) return Results.NotFound();

            var existingAccess = await db.CourseAccesses
                .FirstOrDefaultAsync(ca => ca.CourseId == id && ca.UserId == request.UserId);

            if (existingAccess is null)
            {
                var access = new CourseAccess
                {
                    CourseId = id,
                    UserId = request.UserId,
                    GrantedAt = DateTime.UtcNow
                };
                db.CourseAccesses.Add(access);
                await db.SaveChangesAsync();
            }

            return Results.Ok();
        });
    }

    private static bool HasEditAccess(string? role, string? userIdStr, Guid authorId)
    {
        if (role == "Admin") return true;
        
        if (role == "Company" && Guid.TryParse(userIdStr, out var userId) && userId == authorId)
        {
            return true;
        }

        return false;
    }

    private static async Task<bool> HasViewAccessAsync(string? userIdStr, Guid courseId, CatalogDbContext db)
    {
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return false;
        }

        var access = await db.CourseAccesses.FirstOrDefaultAsync(ca => ca.UserId == userId && ca.CourseId == courseId);
        if (access != null) return true;

        var hasEnrollment = await db.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == courseId && e.Status == EnrollmentStatus.Active);
        return hasEnrollment;
    }
}
