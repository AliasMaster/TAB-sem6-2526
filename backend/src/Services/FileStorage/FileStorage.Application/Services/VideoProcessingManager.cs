using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MassTransit;
using Microsoft.Extensions.Logging;
using FileStorage.Application.Common.Interfaces;
using FileStorage.Domain.Entities;
using Shared.Events;

namespace FileStorage.Application.Services;

public class VideoProcessingManager : IVideoProcessingManager
{
    private readonly Dictionary<Guid, JobStatus> _jobs = new();
    private readonly IBus _publishEndpoint;
    private readonly ILogger<VideoProcessingManager> _logger;

    public VideoProcessingManager(IBus publishEndpoint, ILogger<VideoProcessingManager> logger)
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

    public async Task ProcessVideoAsync(Guid jobId, Guid lessonId, string inputPath, string outputDir)
    {
        var cts = new CancellationTokenSource();
        var status = new JobStatus { JobId = jobId, LessonId = lessonId, Status = "Processing", Progress = 0, Cts = cts };
        _jobs[jobId] = status;

        try
        {
            await _publishEndpoint.Publish(new VideoProcessingStartedEvent(jobId));

            var jobOutputDir = Path.Combine(outputDir, jobId.ToString());
            Directory.CreateDirectory(jobOutputDir);

            if (inputPath.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) || inputPath.EndsWith(".md", StringComparison.OrdinalIgnoreCase))
            {
                var fileName = Path.GetFileName(inputPath).Replace("_raw", "");
                var outputPath = Path.Combine(jobOutputDir, fileName);
                File.Copy(inputPath, outputPath, true);
                
                status.Status = "Completed";
                status.Progress = 100;
                status.HlsUrl = $"{jobId}/{fileName}";
                await _publishEndpoint.Publish(new VideoProcessingCompletedEvent(jobId, status.HlsUrl, lessonId));
                return;
            }

            var videoOutputPath = Path.Combine(jobOutputDir, "index.m3u8");

            var ffmpegArgs = $"-y -i \"{inputPath}\" -codec:v libx264 -preset ultrafast -threads 0 -codec:a aac -map 0 -f hls -hls_time 10 -hls_playlist_type vod \"{videoOutputPath}\" -progress pipe:1";

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
            process.ErrorDataReceived += (sender, e) => { /* ignore stderr to prevent deadlock */ };
            process.Start();
            process.BeginErrorReadLine();

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
                        if (long.TryParse(line.Split('=')[1], out var timeUs) && duration > 0)
                        {
                            var timeSeconds = timeUs / 1000000.0;
                            var progress = (int)(timeSeconds / duration * 100);
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
                await _publishEndpoint.Publish(new VideoProcessingCompletedEvent(jobId, status.HlsUrl, lessonId));
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
            await p.WaitForExitAsync();
            return double.TryParse(output.Trim(), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var duration) ? duration : 0;
        }
        catch { return 0; }
    }
}
