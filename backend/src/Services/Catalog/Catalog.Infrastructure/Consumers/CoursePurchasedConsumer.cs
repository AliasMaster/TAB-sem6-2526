using System.Threading.Tasks;
using MassTransit;
using Shared.Events;
using CatalogService.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace CatalogService.Infrastructure.Consumers;

public class CoursePurchasedConsumer : IConsumer<CoursePurchasedIntegrationEvent>
{
    private readonly ICourseService _courseService;
    private readonly ILogger<CoursePurchasedConsumer> _logger;

    public CoursePurchasedConsumer(ICourseService courseService, ILogger<CoursePurchasedConsumer> logger)
    {
        _courseService = courseService;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<CoursePurchasedIntegrationEvent> context)
    {
        var @event = context.Message;
        _logger.LogInformation(
            "Catalog: Processing CoursePurchasedIntegrationEvent for User {UserId}, Course {CourseId}",
            @event.UserId, @event.CourseId);

        var granted = await _courseService.GrantAccessAsync(@event.CourseId, @event.UserId, context.CancellationToken);

        if (granted)
            _logger.LogInformation("Catalog: Access granted to Course {CourseId} for User {UserId}", @event.CourseId, @event.UserId);
        else
            _logger.LogWarning("Catalog: Could not grant access to Course {CourseId} for User {UserId} (course not found?)", @event.CourseId, @event.UserId);
    }
}
