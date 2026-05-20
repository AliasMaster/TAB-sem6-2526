using System.Threading.Tasks;
using MassTransit;
using Shared.Events;
using CatalogService.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace CatalogService.Infrastructure.Consumers;

public class CourseRefundedConsumer : IConsumer<CourseRefundedIntegrationEvent>
{
    private readonly ICourseService _courseService;
    private readonly ILogger<CourseRefundedConsumer> _logger;

    public CourseRefundedConsumer(ICourseService courseService, ILogger<CourseRefundedConsumer> logger)
    {
        _courseService = courseService;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<CourseRefundedIntegrationEvent> context)
    {
        var @event = context.Message;
        _logger.LogInformation(
            "Catalog: Processing CourseRefundedIntegrationEvent for User {UserId}, Course {CourseId}",
            @event.UserId, @event.CourseId);

        var revoked = await _courseService.RevokeAccessAsync(@event.CourseId, @event.UserId, context.CancellationToken);

        if (revoked)
            _logger.LogInformation("Catalog: Access revoked from Course {CourseId} for User {UserId}", @event.CourseId, @event.UserId);
        else
            _logger.LogWarning("Catalog: Could not revoke access from Course {CourseId} for User {UserId} (access record not found?)", @event.CourseId, @event.UserId);
    }
}
