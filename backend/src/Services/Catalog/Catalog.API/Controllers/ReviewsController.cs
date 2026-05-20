using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CatalogService.Domain.Entities;
using CatalogService.Infrastructure.Persistence;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.API.Controllers;

[ApiController]
[Route("courses/{courseId:guid}/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly CatalogDbContext _db;

    public ReviewsController(CatalogDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetReviews([FromRoute] Guid courseId, CancellationToken ct)
    {
        var reviews = await _db.Reviews
            .Where(r => r.CourseId == courseId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return Ok(reviews.Select(r => new { r.Id, r.CourseId, r.UserId, r.Rating, r.Comment, r.CreatedAt }));
    }

    [HttpPost]
    public async Task<IActionResult> CreateReview([FromRoute] Guid courseId, [FromBody] CreateReviewRequest request, CancellationToken ct)
    {
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        if (request.Rating < 1 || request.Rating > 5)
        {
            return BadRequest("Rating must be between 1 and 5.");
        }

        var course = await _db.Courses.FindAsync(new object[] { courseId }, ct);
        if (course == null) return NotFound("Course not found.");

        var hasAccess = await _db.CourseAccesses.AnyAsync(ca => ca.CourseId == courseId && ca.UserId == userId, ct);
        if (!hasAccess)
        {
            return StatusCode(403, "You must be enrolled to leave a review.");
        }

        var existingReview = await _db.Reviews.FirstOrDefaultAsync(r => r.CourseId == courseId && r.UserId == userId, ct);
        if (existingReview != null)
        {
            return BadRequest("You have already reviewed this course.");
        }

        var review = new Review
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            UserId = userId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await _db.Reviews.AddAsync(review, ct);
        await _db.SaveChangesAsync(ct);

        return Created($"/courses/{courseId}/reviews/{review.Id}", new { review.Id, review.CourseId, review.UserId, review.Rating, review.Comment, review.CreatedAt });
    }
}

public record CreateReviewRequest(int Rating, string? Comment);
