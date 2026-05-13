using MassTransit;
using Shared.Events;
using EnrollmentService.Data;
using Microsoft.EntityFrameworkCore;

namespace EnrollmentService.Consumers
{
    public class VideoProcessingCompletedConsumer : IConsumer<VideoProcessingCompletedEvent>
    {
        private readonly EnrollmentDbContext _db;
        private readonly ILogger<VideoProcessingCompletedConsumer> _logger;

        public VideoProcessingCompletedConsumer(EnrollmentDbContext db, ILogger<VideoProcessingCompletedConsumer> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<VideoProcessingCompletedEvent> context)
        {
            var eventData = context.Message;
            _logger.LogInformation($"Received VideoProcessingCompleted for Job {eventData.JobId}. New URL: {eventData.HlsUrl}");

            // Note: In a full system, we would have a table mapping JobId to CourseMaterialId.
            // For now, we log it. To make it work, we would need to store which material this Job belongs to.
            // Assuming we have a way to identify the material, we would update the Catalog via an Internal API or Event.
            
            await Task.CompletedTask;
        }
    }
}
