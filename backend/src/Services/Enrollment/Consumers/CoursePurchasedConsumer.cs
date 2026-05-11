using MassTransit;
using Shared.Events;

using EnrollmentService.Data;
using EnrollmentService.Models;
using Microsoft.EntityFrameworkCore;

namespace EnrollmentService.Consumers;

public class CoursePurchasedConsumer : IConsumer<CoursePurchasedIntegrationEvent>
{
    private readonly EnrollmentDbContext _dbContext;
    private readonly ILogger<CoursePurchasedConsumer> _logger;

    public CoursePurchasedConsumer(EnrollmentDbContext dbContext, ILogger<CoursePurchasedConsumer> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<CoursePurchasedIntegrationEvent> context)
    {
        var @event = context.Message;
        _logger.LogInformation("Processing CoursePurchasedIntegrationEvent for User {UserId}, Course {CourseId}", @event.UserId, @event.CourseId);

        var existing = await _dbContext.Enrollments
            .FirstOrDefaultAsync(e => e.UserId == @event.UserId && e.CourseId == @event.CourseId);

        if (existing == null)
        {
            var enrollment = new Enrollment
            {
                Id = Guid.NewGuid(),
                UserId = @event.UserId,
                CourseId = @event.CourseId,
                Status = EnrollmentStatus.Active,
                EnrolledAt = DateTime.UtcNow
            };
            _dbContext.Enrollments.Add(enrollment);
        }
        else
        {
            existing.Status = EnrollmentStatus.Active;
        }

        await _dbContext.SaveChangesAsync();
    }
}
