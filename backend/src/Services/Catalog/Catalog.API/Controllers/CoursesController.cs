using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CatalogService.Application.Common.Interfaces;
using CatalogService.Application.DTOs;

namespace CatalogService.API.Controllers;

[ApiController]
[Route("courses")]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CourseDto>>> GetAll(CancellationToken ct)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        var courses = await _courseService.GetAllCoursesAsync(role, ct);
        return Ok(courses);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CourseDto>> GetById([FromRoute] Guid id, CancellationToken ct)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        var course = await _courseService.GetCourseByIdAsync(id, role, ct);
        if (course == null)
        {
            return NotFound();
        }
        return Ok(course);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCourseRequest request, CancellationToken ct)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();

        if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) && 
            !string.Equals(role, "Company", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(403);
        }

        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var course = await _courseService.CreateCourseAsync(request, userId, ct);
        return Created($"/courses/{course.Id}", course);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateCourseRequest request, CancellationToken ct)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();

        var result = await _courseService.UpdateCourseAsync(id, request, role, userIdStr, ct);
        if (result == null)
        {
            return NotFound();
        }
        if (result == false)
        {
            return StatusCode(403);
        }

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken ct)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();

        var result = await _courseService.DeleteCourseAsync(id, role, userIdStr, ct);
        if (result == null)
        {
            return NotFound();
        }
        if (result == false)
        {
            return StatusCode(403);
        }

        return NoContent();
    }

    [HttpGet("{id:guid}/materials")]
    public async Task<ActionResult<List<CourseMaterialDto>>> GetMaterials([FromRoute] Guid id, CancellationToken ct)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();

        var materials = await _courseService.GetMaterialsAsync(id, role, userIdStr, ct);
        if (materials == null)
        {
            return NotFound();
        }

        return Ok(materials);
    }

    [HttpPost("{id:guid}/materials")]
    public async Task<IActionResult> AddMaterial(
        [FromRoute] Guid id,
        [FromBody] CreateCourseMaterialRequest request,
        CancellationToken ct)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();

        var material = await _courseService.AddMaterialAsync(id, request, role, userIdStr, ct);
        if (material == null)
        {
            return StatusCode(403);
        }

        return Created($"/courses/{id}/materials", material);
    }

    [HttpPut("{id:guid}/materials/{materialId:guid}")]
    public async Task<IActionResult> UpdateMaterial(
        [FromRoute] Guid id,
        [FromRoute] Guid materialId,
        [FromBody] UpdateCourseMaterialRequest request,
        CancellationToken ct)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();

        var result = await _courseService.UpdateMaterialAsync(id, materialId, request, role, userIdStr, ct);
        if (result == null) return NotFound();
        if (result == false) return StatusCode(403);

        return NoContent();
    }

    [HttpDelete("{id:guid}/materials/{materialId:guid}")]
    public async Task<IActionResult> DeleteMaterial(
        [FromRoute] Guid id,
        [FromRoute] Guid materialId,
        CancellationToken ct)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();

        var result = await _courseService.DeleteMaterialAsync(id, materialId, role, userIdStr, ct);
        if (result == null) return NotFound();
        if (result == false) return StatusCode(403);

        return NoContent();
    }

    [HttpPut("{id:guid}/block")]
    public async Task<IActionResult> BlockCourse([FromRoute] Guid id, [FromQuery] bool block, CancellationToken ct)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(403);
        }

        var success = await _courseService.BlockCourseAsync(id, block, ct);
        if (!success) return NotFound();

        return NoContent();
    }

    [HttpPost("{id:guid}/access")]
    public async Task<IActionResult> GrantAccess([FromRoute] Guid id, [FromBody] GrantAccessRequest request, CancellationToken ct)
    {
        var success = await _courseService.GrantAccessAsync(id, request.UserId, ct);
        if (!success)
        {
            return NotFound();
        }
        return Ok();
    }

    [HttpGet("{courseId:guid}/lessons/{lessonId:guid}/verify-access")]
    public async Task<IActionResult> VerifyAccess(
        [FromRoute] Guid courseId,
        [FromRoute] Guid lessonId,
        CancellationToken ct)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();

        var contentUrl = await _courseService.VerifyAccessAsync(courseId, lessonId, role, userIdStr, ct);
        if (contentUrl == null)
        {
            return StatusCode(403);
        }

        return Ok(new { ContentUrl = contentUrl });
    }
}
