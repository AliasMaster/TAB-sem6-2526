using System;
using System.Threading.Tasks;
using FileStorage.Domain.Entities;

namespace FileStorage.Application.Common.Interfaces;

public interface IVideoProcessingManager
{
    JobStatus? GetStatus(Guid jobId);
    bool CancelJob(Guid jobId);
    Task ProcessVideoAsync(Guid jobId, Guid lessonId, string inputPath, string outputDir);
}
