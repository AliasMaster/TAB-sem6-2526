using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EnrollmentService.Application.Common.Interfaces;
using EnrollmentService.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EnrollmentService.API.Controllers;

[ApiController]
[Route("")]
public class EnrollmentsController : ControllerBase
{
    private readonly IEnrollmentService _enrollmentService;
    private readonly IHttpClientFactory _httpClientFactory;

    public EnrollmentsController(IEnrollmentService enrollmentService, IHttpClientFactory httpClientFactory)
    {
        _enrollmentService = enrollmentService;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMy(CancellationToken ct)
    {
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var enrollments = await _enrollmentService.GetMyActiveEnrollmentsAsync(userId, ct);
        return Ok(enrollments);
    }

    [HttpGet("course/{courseId:guid}/lessons")]
    public async Task<IActionResult> GetCourseLessons([FromRoute] Guid courseId, CancellationToken ct)
    {
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        var hasAccess = await _enrollmentService.HasAccessToCourseAsync(userId, courseId, role, ct);
        if (!hasAccess)
        {
            return StatusCode(403, "Access denied. Enrollment required.");
        }

        var client = _httpClientFactory.CreateClient("CatalogService");
        var request = new HttpRequestMessage(HttpMethod.Get, $"/courses/{courseId}/materials");
        foreach (var header in Request.Headers)
        {
            if (header.Key.StartsWith("X-User-"))
            {
                request.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }
        }

        var response = await client.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            return StatusCode((int)response.StatusCode);
        }

        var materials = await response.Content.ReadFromJsonAsync<List<CourseMaterialDto>>(cancellationToken: ct);
        return Ok(materials);
    }

    [HttpGet("course/{courseId:guid}/lesson/{lessonId:guid}/content")]
    public async Task<IActionResult> GetLessonContent(
        [FromRoute] Guid courseId,
        [FromRoute] Guid lessonId,
        CancellationToken ct)
    {
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        var hasAccess = await _enrollmentService.HasAccessToCourseAsync(userId, courseId, role, ct);
        if (!hasAccess)
        {
            return StatusCode(403, "Access denied. Enrollment required.");
        }

        var catalogClient = _httpClientFactory.CreateClient("CatalogService");
        var catalogRequest = new HttpRequestMessage(HttpMethod.Get, $"/courses/{courseId}/materials");
        foreach (var header in Request.Headers)
        {
            if (header.Key.StartsWith("X-User-"))
            {
                catalogRequest.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }
        }
        var materialsResponse = await catalogClient.SendAsync(catalogRequest, ct);
        if (!materialsResponse.IsSuccessStatusCode)
        {
            return StatusCode((int)materialsResponse.StatusCode);
        }

        var materials = await materialsResponse.Content.ReadFromJsonAsync<List<CourseMaterialDto>>(cancellationToken: ct);
        var lesson = materials?.FirstOrDefault(m => m.Id == lessonId);

        if (lesson == null)
        {
            return NotFound();
        }

        var fileClient = _httpClientFactory.CreateClient("FileStorage");
        var fileUrl = $"/files/{lesson.ContentUrl}";
        var fileRequest = new HttpRequestMessage(HttpMethod.Get, fileUrl);

        if (Request.Headers.TryGetValue("Range", out var range))
        {
            fileRequest.Headers.Add("Range", range.ToString());
        }

        var fileResponse = await fileClient.SendAsync(fileRequest, HttpCompletionOption.ResponseHeadersRead, ct);

        if (!fileResponse.IsSuccessStatusCode && fileResponse.StatusCode != System.Net.HttpStatusCode.PartialContent)
        {
            return StatusCode((int)fileResponse.StatusCode);
        }

        var contentType = fileResponse.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";
        var responseStream = await fileResponse.Content.ReadAsStreamAsync(ct);

        foreach (var header in fileResponse.Headers)
        {
            Response.Headers.TryAdd(header.Key, header.Value.ToArray());
        }
        foreach (var header in fileResponse.Content.Headers)
        {
            Response.Headers.TryAdd(header.Key, header.Value.ToArray());
        }

        if (fileResponse.StatusCode == System.Net.HttpStatusCode.PartialContent)
        {
            Response.StatusCode = 206;
        }

        return File(responseStream, contentType, enableRangeProcessing: true);
    }

    [HttpPost("course/{courseId:guid}/lessons/{lessonId:guid}/complete")]
    public async Task<IActionResult> CompleteLesson(
        [FromRoute] Guid courseId,
        [FromRoute] Guid lessonId,
        [FromServices] EnrollmentService.Infrastructure.Persistence.EnrollmentDbContext db,
        CancellationToken ct)
    {
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var progress = await db.Progresses.FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId, ct);
        if (progress == null)
        {
            progress = new EnrollmentService.Domain.Entities.Progress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                LessonId = lessonId,
                IsCompleted = true,
                LastAccessed = DateTime.UtcNow
            };
            await db.Progresses.AddAsync(progress, ct);
        }
        else
        {
            progress.IsCompleted = true;
            progress.LastAccessed = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
        return Ok();
    }

    [HttpGet("course/{courseId:guid}/progress")]
    public async Task<IActionResult> GetCourseProgress(
        [FromRoute] Guid courseId,
        [FromServices] EnrollmentService.Infrastructure.Persistence.EnrollmentDbContext db,
        CancellationToken ct)
    {
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        // To properly filter by courseId, we need to know which lessons belong to the course.
        // The quickest way here is to fetch lesson IDs from Catalog.
        var client = _httpClientFactory.CreateClient("CatalogService");
        var request = new HttpRequestMessage(HttpMethod.Get, $"/courses/{courseId}/materials");
        foreach (var header in Request.Headers)
        {
            if (header.Key.StartsWith("X-User-"))
            {
                request.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }
        }

        var response = await client.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            return StatusCode((int)response.StatusCode);
        }

        var materials = await response.Content.ReadFromJsonAsync<List<CourseMaterialDto>>(cancellationToken: ct);
        if (materials == null) return NotFound();

        var lessonIds = materials.Select(m => m.Id).ToList();

        var progresses = await db.Progresses
            .Where(p => p.UserId == userId && lessonIds.Contains(p.LessonId))
            .ToListAsync(ct);

        var result = materials.Select(m => new
        {
            LessonId = m.Id,
            IsCompleted = progresses.FirstOrDefault(p => p.LessonId == m.Id)?.IsCompleted ?? false
        });

        return Ok(result);
    }
}
