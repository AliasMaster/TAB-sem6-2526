namespace Shared.Events;

public record CoursePurchasedIntegrationEvent(Guid UserId, Guid CourseId);
public record CourseRefundedIntegrationEvent(Guid UserId, Guid CourseId);
