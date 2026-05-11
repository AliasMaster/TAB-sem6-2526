using MassTransit;
using Shared.Events;

using EnrollmentService.Data;
using EnrollmentService.Models;
using Microsoft.EntityFrameworkCore;

namespace EnrollmentService.Consumers;

public class CourseRefundedConsumer : IConsumer<CourseRefundedIntegrationEvent>
{
    private readonly EnrollmentDbContext _dbContext;
    private readonly ILogger<CourseRefundedConsumer> _logger;

    public CourseRefundedConsumer(EnrollmentDbContext dbContext, ILogger<CourseRefundedConsumer> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<CourseRefundedIntegrationEvent> context)
    {
        var @event = context.Message;
        _logger.LogInformation("Processing CourseRefundedIntegrationEvent for User {UserId}, Course {CourseId}", @event.UserId, @event.CourseId);

        var existing = await _dbContext.Enrollments
            .FirstOrDefaultAsync(e => e.UserId == @event.UserId && e.CourseId == @event.CourseId);

        if (existing != null)
        {
            existing.Status = EnrollmentStatus.Revoked;
            await _dbContext.SaveChangesAsync();
        }
    }
}
