using System.Threading.Tasks;
using MassTransit;
using Shared.Events;
using EnrollmentService.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace EnrollmentService.Infrastructure.Consumers;

public class CourseRefundedConsumer : IConsumer<CourseRefundedIntegrationEvent>
{
    private readonly IEnrollmentService _enrollmentService;
    private readonly ILogger<CourseRefundedConsumer> _logger;

    public CourseRefundedConsumer(IEnrollmentService enrollmentService, ILogger<CourseRefundedConsumer> _logger)
    {
        _enrollmentService = enrollmentService;
        this._logger = _logger;
    }

    public async Task Consume(ConsumeContext<CourseRefundedIntegrationEvent> context)
    {
        var @event = context.Message;
        _logger.LogInformation("Processing CourseRefundedIntegrationEvent for User {UserId}, Course {CourseId}", @event.UserId, @event.CourseId);

        await _enrollmentService.RefundCourseAsync(@event.UserId, @event.CourseId, context.CancellationToken);
    }
}
