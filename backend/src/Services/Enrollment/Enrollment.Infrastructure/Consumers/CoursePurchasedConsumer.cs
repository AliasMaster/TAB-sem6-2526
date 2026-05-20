using System.Threading.Tasks;
using MassTransit;
using Shared.Events;
using EnrollmentService.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace EnrollmentService.Infrastructure.Consumers;

public class CoursePurchasedConsumer : IConsumer<CoursePurchasedIntegrationEvent>
{
    private readonly IEnrollmentService _enrollmentService;
    private readonly ILogger<CoursePurchasedConsumer> _logger;

    public CoursePurchasedConsumer(IEnrollmentService enrollmentService, ILogger<CoursePurchasedConsumer> _logger)
    {
        _enrollmentService = enrollmentService;
        this._logger = _logger;
    }

    public async Task Consume(ConsumeContext<CoursePurchasedIntegrationEvent> context)
    {
        var @event = context.Message;
        _logger.LogInformation("Processing CoursePurchasedIntegrationEvent for User {UserId}, Course {CourseId}", @event.UserId, @event.CourseId);

        await _enrollmentService.PurchaseCourseAsync(@event.UserId, @event.CourseId, context.CancellationToken);
    }
}
