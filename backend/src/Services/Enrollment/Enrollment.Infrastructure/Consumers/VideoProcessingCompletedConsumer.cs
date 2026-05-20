using System.Threading.Tasks;
using MassTransit;
using Shared.Events;
using Microsoft.Extensions.Logging;

namespace EnrollmentService.Infrastructure.Consumers;

public class VideoProcessingCompletedConsumer : IConsumer<VideoProcessingCompletedEvent>
{
    private readonly ILogger<VideoProcessingCompletedConsumer> _logger;

    public VideoProcessingCompletedConsumer(ILogger<VideoProcessingCompletedConsumer> _logger)
    {
        this._logger = _logger;
    }

    public async Task Consume(ConsumeContext<VideoProcessingCompletedEvent> context)
    {
        var eventData = context.Message;
        _logger.LogInformation("Received VideoProcessingCompleted for Job {JobId}. New URL: {HlsUrl}", eventData.JobId, eventData.HlsUrl);

        await Task.CompletedTask;
    }
}
