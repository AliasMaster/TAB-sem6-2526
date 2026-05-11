using System;

namespace Shared.Contracts
{
    public record CoursePurchasedIntegrationEvent(Guid UserId, Guid CourseId);
    public record CourseRefundedIntegrationEvent(Guid UserId, Guid CourseId);
}
