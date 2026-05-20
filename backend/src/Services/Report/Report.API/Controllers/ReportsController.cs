using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Report.Application.Common.Interfaces;
using Report.Application.DTOs;

namespace Report.API.Controllers;

[ApiController]
[Route("")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Report service is running");
    }

    [HttpGet("course-sales")]
    public async Task<IActionResult> GetCourseSales(
        [FromQuery] DateOnly startDate,
        [FromQuery] DateOnly endDate,
        [FromQuery] Guid? courseId,
        CancellationToken ct)
    {
        var role = GetUserRole();
        if (role == null || (!role.Equals("admin", StringComparison.OrdinalIgnoreCase) && !role.Equals("company", StringComparison.OrdinalIgnoreCase)))
        {
            return StatusCode(403, "Access denied. Admin or Company role required.");
        }

        Guid? companyId = null;
        if (role.Equals("company", StringComparison.OrdinalIgnoreCase))
        {
            companyId = GetUserId();
            if (companyId == null)
            {
                return BadRequest("Invalid or missing X-User-Id header.");
            }
        }

        var report = await _reportService.GetCourseSalesAsync(startDate, endDate, courseId, companyId, ct);
        return Ok(report);
    }

    [HttpGet("user-activity")]
    public async Task<IActionResult> GetUserActivity(
        [FromQuery] DateOnly startDate,
        [FromQuery] DateOnly endDate,
        [FromQuery] Guid? userId,
        CancellationToken ct)
    {
        var role = GetUserRole();
        if (role == null || (!role.Equals("admin", StringComparison.OrdinalIgnoreCase) && !role.Equals("company", StringComparison.OrdinalIgnoreCase)))
        {
            return StatusCode(403, "Access denied. Admin or Company role required.");
        }

        Guid? companyId = null;
        if (role.Equals("company", StringComparison.OrdinalIgnoreCase))
        {
            companyId = GetUserId();
            if (companyId == null)
            {
                return BadRequest("Invalid or missing X-User-Id header.");
            }
        }

        var report = await _reportService.GetUserActivityAsync(startDate, endDate, userId, companyId, ct);
        return Ok(report);
    }

    [HttpGet("course-activity")]
    public async Task<IActionResult> GetCourseActivity(
        [FromQuery] DateOnly startDate,
        [FromQuery] DateOnly endDate,
        CancellationToken ct)
    {
        var role = GetUserRole();
        if (role == null || (!role.Equals("admin", StringComparison.OrdinalIgnoreCase) && !role.Equals("company", StringComparison.OrdinalIgnoreCase)))
        {
            return StatusCode(403, "Access denied. Admin or Company role required.");
        }

        Guid? companyId = null;
        if (role.Equals("company", StringComparison.OrdinalIgnoreCase))
        {
            companyId = GetUserId();
            if (companyId == null)
            {
                return BadRequest("Invalid or missing X-User-Id header.");
            }
        }

        var report = await _reportService.GetCourseActivityAsync(startDate, endDate, companyId, ct);
        return Ok(report);
    }

    private string? GetUserRole()
    {
        return Request.Headers["X-User-Role"].FirstOrDefault();
    }

    private Guid? GetUserId()
    {
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
        if (Guid.TryParse(userIdStr, out var userId))
        {
            return userId;
        }
        return null;
    }
}
