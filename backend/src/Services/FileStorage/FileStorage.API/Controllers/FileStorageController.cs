using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using FileStorage.Application.Common.Interfaces;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using Microsoft.Extensions.Configuration;

namespace FileStorage.API.Controllers;

[ApiController]
[Route("")]
public class FileStorageController : ControllerBase
{
    private readonly IVideoProcessingManager _manager;
    private readonly IWebHostEnvironment _env;
    private readonly IHttpClientFactory _clientFactory;
    private readonly IConfiguration _config;

    public FileStorageController(
        IVideoProcessingManager manager,
        IWebHostEnvironment env,
        IHttpClientFactory clientFactory,
        IConfiguration config)
    {
        _manager = manager;
        _env = env;
        _clientFactory = clientFactory;
        _config = config;
    }

    [HttpPost("upload")]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] Guid lessonId)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        if (string.IsNullOrEmpty(role) || 
            (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) && 
             !string.Equals(role, "Company", StringComparison.OrdinalIgnoreCase)))
        {
            return StatusCode(403);
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        if (lessonId == Guid.Empty)
        {
            return BadRequest("Invalid or missing lessonId");
        }

        var uploadsPath = Path.Combine(_env.ContentRootPath, "uploads");
        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

        var jobId = Guid.NewGuid();
        var extension = Path.GetExtension(file.FileName);
        var rawFileName = $"{jobId}_raw{extension}";
        var rawFilePath = Path.Combine(uploadsPath, rawFileName);

        using (var stream = new FileStream(rawFilePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        _ = _manager.ProcessVideoAsync(jobId, lessonId, rawFilePath, uploadsPath);

        return Accepted($"/status/{jobId}", new { JobId = jobId, Message = "Upload successful. Processing started." });
    }

    [HttpGet("status/{jobId:guid}")]
    public IActionResult GetStatus([FromRoute] Guid jobId)
    {
        var status = _manager.GetStatus(jobId);
        if (status == null)
        {
            return NotFound();
        }
        return Ok(status);
    }

    [HttpPost("cancel/{jobId:guid}")]
    public IActionResult Cancel([FromRoute] Guid jobId)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        if (string.IsNullOrEmpty(role) || 
            (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) && 
             !string.Equals(role, "Company", StringComparison.OrdinalIgnoreCase)))
        {
            return StatusCode(403);
        }

        var success = _manager.CancelJob(jobId);
        return success ? Ok("Job cancelled") : NotFound("Job not found or already completed");
    }

    [HttpGet("courses/{courseId:guid}/lessons/{lessonId:guid}/content/{**fileName}")]
    public async Task<IActionResult> GetFile(
        [FromRoute] Guid courseId,
        [FromRoute] Guid lessonId,
        [FromRoute] string? fileName,
        CancellationToken ct)
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault();
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();

        var client = _clientFactory.CreateClient();
        var catalogUrl = _config["CATALOG_SERVICE_URL"] ?? "http://catalog-service:8080";
        var requestUrl = $"{catalogUrl}/courses/{courseId}/lessons/{lessonId}/verify-access";

        var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
        if (!string.IsNullOrEmpty(role)) request.Headers.Add("X-User-Role", role);
        if (!string.IsNullOrEmpty(userIdStr)) request.Headers.Add("X-User-Id", userIdStr);

        var response = await client.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            return StatusCode((int)response.StatusCode);
        }

        var result = await response.Content.ReadFromJsonAsync<VerifyAccessResponse>(cancellationToken: ct);
        if (result == null || string.IsNullOrEmpty(result.ContentUrl))
        {
            return NotFound("Video content not found or not yet processed.");
        }

        var parts = result.ContentUrl.Split('/');
        var jobIdFolder = parts[0];

        var uploadsPath = Path.Combine(_env.ContentRootPath, "uploads");

        // Determine the actual file to serve.
        // For HLS video: contentUrl = "{jobId}/index.m3u8". The URL's fileName
        //   parameter specifies the segment (e.g. "segment_0.ts") or is empty for manifest.
        // For PDF/other: contentUrl = "{jobId}/file.pdf". The URL's fileName parameter
        //   is just a placeholder like "document.pdf" and should be ignored — use contentUrl directly.
        string targetRelativePath;
        if (result.ContentUrl.EndsWith(".m3u8", StringComparison.OrdinalIgnoreCase))
        {
            // HLS video — use fileName from URL for segments, or default to manifest
            var targetFileName = string.IsNullOrEmpty(fileName) ? "index.m3u8" : fileName;
            targetRelativePath = Path.Combine(jobIdFolder, targetFileName);
        }
        else
        {
            // PDF or other direct file — contentUrl IS the relative path
            targetRelativePath = result.ContentUrl;
        }

        var filePath = Path.GetFullPath(Path.Combine(uploadsPath, targetRelativePath));

        if (!filePath.StartsWith(uploadsPath, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Invalid file name");
        }

        if (!System.IO.File.Exists(filePath))
        {
            return NotFound();
        }

        var contentType = filePath.ToLower() switch
        {
            var f when f.EndsWith(".m3u8") => "application/x-mpegURL",
            var f when f.EndsWith(".ts") => "video/MP2T",
            var f when f.EndsWith(".mp4") => "video/mp4",
            var f when f.EndsWith(".pdf") => "application/pdf",
            var f when f.EndsWith(".md") => "text/markdown",
            _ => "application/octet-stream"
        };

        return PhysicalFile(filePath, contentType, enableRangeProcessing: true);
    }

    private record VerifyAccessResponse(string ContentUrl);

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { status = "Healthy", service = "FileStorage" });
    }
}
