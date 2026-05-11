using System.Diagnostics;
using System.Text.RegularExpressions;
using MassTransit;
using Microsoft.Extensions.FileProviders;
using Shared.Events;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// MassTransit Configuration
builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitUrl = Environment.GetEnvironmentVariable("RABBITMQ_URL") ?? "amqp://guest:guest@localhost";
        cfg.Host(new Uri(rabbitUrl));
    });
});

builder.Services.AddSingleton<VideoProcessingManager>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath)) Directory.CreateDirectory(uploadsPath);

// 1. Upload Video Endpoint (SECURED: Company or Admin only)
app.MapPost("/upload", async (HttpContext httpContext, IFormFile file, VideoProcessingManager manager, IPublishEndpoint publishEndpoint) =>
{
    var role = httpContext.Request.Headers["X-User-Role"].FirstOrDefault();
    if (string.IsNullOrEmpty(role) || 
        (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) && 
         !string.Equals(role, "Company", StringComparison.OrdinalIgnoreCase)))
    {
        return Results.StatusCode(403);
    }

    if (file == null || file.Length == 0) return Results.BadRequest("No file uploaded");

    var jobId = Guid.NewGuid();
    var extension = Path.GetExtension(file.FileName);
    var rawFileName = $"{jobId}_raw{extension}";
    var rawFilePath = Path.Combine(uploadsPath, rawFileName);

    using (var stream = new FileStream(rawFilePath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    _ = manager.ProcessVideoAsync(jobId, rawFilePath, uploadsPath);

    return Results.Accepted($"/status/{jobId}", new { JobId = jobId, Message = "Upload successful. Processing started." });
});

// 2. Status / Progress Endpoint
app.MapGet("/status/{jobId:guid}", (Guid jobId, VideoProcessingManager manager) =>
{
    var status = manager.GetStatus(jobId);
    if (status == null) return Results.NotFound();
    return Results.Ok(status);
});

// 3. Cancel Job Endpoint (SECURED: Company or Admin only)
app.MapPost("/cancel/{jobId:guid}", (HttpContext httpContext, Guid jobId, VideoProcessingManager manager) =>
{
    var role = httpContext.Request.Headers["X-User-Role"].FirstOrDefault();
    if (string.IsNullOrEmpty(role) || 
        (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) && 
         !string.Equals(role, "Company", StringComparison.OrdinalIgnoreCase)))
    {
        return Results.StatusCode(403);
    }

    var success = manager.CancelJob(jobId);
    return success ? Results.Ok("Job cancelled") : Results.NotFound("Job not found or already completed");
});

app.MapGet("/files/{fileName}", (string fileName) =>
{
    var filePath = Path.Combine(uploadsPath, fileName);
    if (!File.Exists(filePath)) return Results.NotFound();

    var contentType = fileName.ToLower() switch
    {
        var f when f.EndsWith(".m3u8") => "application/x-mpegURL",
        var f when f.EndsWith(".ts") => "video/MP2T",
        var f when f.EndsWith(".mp4") => "video/mp4",
        var f when f.EndsWith(".pdf") => "application/pdf",
        _ => "application/octet-stream"
    };

    return Results.File(filePath, contentType, enableRangeProcessing: true);
});

app.MapGet("/health", () => Results.Ok(new { status = "Healthy", service = "FileStorage" }));

app.Run();

public class VideoProcessingManager
{
    private readonly Dictionary<Guid, JobStatus> _jobs = new();
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<VideoProcessingManager> _logger;

    public VideoProcessingManager(IPublishEndpoint publishEndpoint, ILogger<VideoProcessingManager> logger)
    {
        _publishEndpoint = publishEndpoint;
        _logger = logger;
    }

    public JobStatus? GetStatus(Guid jobId) => _jobs.TryGetValue(jobId, out var status) ? status : null;

    public bool CancelJob(Guid jobId)
    {
        if (_jobs.TryGetValue(jobId, out var status) && status.Cts != null)
        {
            status.Cts.Cancel();
            return true;
        }
        return false;
    }

    public async Task ProcessVideoAsync(Guid jobId, string inputPath, string outputDir)
    {
        var cts = new CancellationTokenSource();
        var status = new JobStatus { JobId = jobId, Status = "Processing", Progress = 0, Cts = cts };
        _jobs[jobId] = status;

        try
        {
            await _publishEndpoint.Publish(new VideoProcessingStartedEvent(jobId));

            var jobOutputDir = Path.Combine(outputDir, jobId.ToString());
            Directory.CreateDirectory(jobOutputDir);
            var outputPath = Path.Combine(jobOutputDir, "index.m3u8");

            var ffmpegArgs = $"-i \"{inputPath}\" -codec:v libx264 -codec:a aac -map 0 -f hls -hls_time 10 -hls_playlist_type event \"{outputPath}\" -progress pipe:1";

            var processInfo = new ProcessStartInfo
            {
                FileName = "ffmpeg",
                Arguments = ffmpegArgs,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = new Process { StartInfo = processInfo };
            process.Start();

            var durationTask = GetDurationAsync(inputPath);
            _ = Task.Run(async () =>
            {
                var duration = await durationTask;
                using var reader = process.StandardOutput;
                while (!reader.EndOfStream && !cts.Token.IsCancellationRequested)
                {
                    var line = await reader.ReadLineAsync();
                    if (line != null && line.StartsWith("out_time_ms="))
                    {
                        if (long.TryParse(line.Split('=')[1], out var timeMs) && duration > 0)
                        {
                            var progress = (int)((timeMs / 1000.0) / duration * 100);
                            status.Progress = Math.Min(progress, 99);
                            await _publishEndpoint.Publish(new VideoProcessingProgressEvent(jobId, status.Progress));
                        }
                    }
                }
            });

            await process.WaitForExitAsync(cts.Token);

            if (process.ExitCode == 0)
            {
                status.Status = "Completed";
                status.Progress = 100;
                status.HlsUrl = $"{jobId}/index.m3u8";
                await _publishEndpoint.Publish(new VideoProcessingCompletedEvent(jobId, status.HlsUrl));
            }
            else
            {
                throw new Exception($"FFmpeg exited with code {process.ExitCode}");
            }
        }
        catch (OperationCanceledException)
        {
            status.Status = "Cancelled";
            _logger.LogInformation($"Job {jobId} cancelled by user.");
            await _publishEndpoint.Publish(new VideoProcessingFailedEvent(jobId, "Cancelled by user"));
        }
        catch (Exception ex)
        {
            status.Status = "Failed";
            status.Error = ex.Message;
            _logger.LogError(ex, $"Error processing video {jobId}");
            await _publishEndpoint.Publish(new VideoProcessingFailedEvent(jobId, ex.Message));
        }
        finally
        {
            if (File.Exists(inputPath)) File.Delete(inputPath);
        }
    }

    private async Task<double> GetDurationAsync(string path)
    {
        try
        {
            var info = new ProcessStartInfo
            {
                FileName = "ffprobe",
                Arguments = $"-v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \"{path}\"",
                RedirectStandardOutput = true,
                UseShellExecute = false
            };
            using var p = Process.Start(info);
            var output = await p!.StandardOutput.ReadToEndAsync();
            return double.TryParse(output, out var duration) ? duration : 0;
        }
        catch { return 0; }
    }
}

public class JobStatus
{
    public Guid JobId { get; set; }
    public string Status { get; set; } = "";
    public int Progress { get; set; }
    public string? HlsUrl { get; set; }
    public string? Error { get; set; }
    internal CancellationTokenSource? Cts { get; set; }
}

namespace Shared.Events
{
    public record VideoProcessingStartedEvent(Guid JobId);
    public record VideoProcessingProgressEvent(Guid JobId, int Progress);
    public record VideoProcessingCompletedEvent(Guid JobId, string HlsUrl);
    public record VideoProcessingFailedEvent(Guid JobId, string Error);
}
