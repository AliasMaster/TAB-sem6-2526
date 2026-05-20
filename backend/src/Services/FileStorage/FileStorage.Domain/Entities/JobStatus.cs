using System;
using System.Threading;
using System.Text.Json.Serialization;

namespace FileStorage.Domain.Entities;

public class JobStatus
{
    public Guid JobId { get; set; }
    public Guid LessonId { get; set; }
    public string Status { get; set; } = "";
    public int Progress { get; set; }
    public string? HlsUrl { get; set; }
    public string? Error { get; set; }

    [JsonIgnore]
    public CancellationTokenSource? Cts { get; set; }
}
