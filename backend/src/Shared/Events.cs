using System;

namespace Shared.Contracts
{
    public record CoursePurchasedIntegrationEvent(Guid UserId, Guid CourseId, decimal Amount);
    public record CourseRefundedIntegrationEvent(Guid UserId, Guid CourseId);
}
