using MassTransit;
using ReportService.Data;
using Shared.Events;

namespace ReportService.Consumers;

public class UserActivityReportConsumer : IConsumer<UserActivityIntegrationEvent>
{
    private readonly ReportDbContext _dbContext;
    private readonly ILogger<UserActivityReportConsumer> _logger;

    public UserActivityReportConsumer(ReportDbContext dbContext, ILogger<UserActivityReportConsumer> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<UserActivityIntegrationEvent> context)
    {
        var @event = context.Message;
        _logger.LogInformation("ReportService: Otrzymano aktywność usera {UserId} typu {ActivityType}", @event.UserId, @event.ActivityType);

        if (!Enum.TryParse<ActivityType>(@event.ActivityType, true, out var type))
        {
            _logger.LogWarning("Nieznany typ aktywności: {ActivityType}", @event.ActivityType);
            return;
        }

        var record = new UserActivityRecord
        {
            Id = Guid.NewGuid(),
            UserId = @event.UserId,
            Type = type,
            ActivityDate = DateTime.UtcNow
        };

        _dbContext.UserActivities.Add(record);
        await _dbContext.SaveChangesAsync();
    }
}
