using System.Threading.Tasks;
using MassTransit;
using Shared.Events;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using CatalogService.Domain.Interfaces;
using CatalogService.Infrastructure.Persistence;

namespace CatalogService.Infrastructure.Consumers;

public class VideoProcessingCompletedConsumer : IConsumer<VideoProcessingCompletedEvent>
{
    private readonly CatalogDbContext _db;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<VideoProcessingCompletedConsumer> _logger;

    public VideoProcessingCompletedConsumer(
        CatalogDbContext db,
        IUnitOfWork unitOfWork,
        ILogger<VideoProcessingCompletedConsumer> logger)
    {
        _db = db;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<VideoProcessingCompletedEvent> context)
    {
        var msg = context.Message;
        _logger.LogInformation("Consuming VideoProcessingCompletedEvent for Lesson {LessonId}, New HlsUrl: {HlsUrl}", msg.LessonId, msg.HlsUrl);

        var lesson = await _db.CourseMaterials.FirstOrDefaultAsync(l => l.Id == msg.LessonId);
        if (lesson == null)
        {
            _logger.LogWarning("Lesson {LessonId} not found in catalog database. Cannot update content URL.", msg.LessonId);
            return;
        }

        lesson.ContentUrl = msg.HlsUrl;
        await _unitOfWork.SaveChangesAsync(context.CancellationToken);

        _logger.LogInformation("Successfully updated Lesson {LessonId} content URL to: {HlsUrl}", msg.LessonId, msg.HlsUrl);
    }
}
