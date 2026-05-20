using MassTransit;
using ReportService.Data;
using Shared.Events;

namespace ReportService.Consumers;

public class OrderPurchasedReportConsumer : IConsumer<CoursePurchasedIntegrationEvent>
{
    private readonly ReportDbContext _dbContext;
    private readonly ILogger<OrderPurchasedReportConsumer> _logger;

    public OrderPurchasedReportConsumer(ReportDbContext dbContext, ILogger<OrderPurchasedReportConsumer> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<CoursePurchasedIntegrationEvent> context)
    {
        var @event = context.Message;
        _logger.LogInformation("ReportService: Zarejestrowano sprzedaż kursu {CourseId} dla usera {UserId} kwota {Amount}", @event.CourseId, @event.UserId, @event.Amount);

        var record = new CourseSaleRecord
        {
            Id = Guid.NewGuid(),
            CourseId = @event.CourseId,
            UserId = @event.UserId,
            Price = @event.Amount,
            PurchasedAt = DateTime.UtcNow
        };

        _dbContext.CourseSales.Add(record);
        await _dbContext.SaveChangesAsync();
    }
}
