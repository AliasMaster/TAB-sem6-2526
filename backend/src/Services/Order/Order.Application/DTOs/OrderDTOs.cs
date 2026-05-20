using System;

namespace Order.Application.DTOs;

public record PurchaseRequest(Guid CourseId, decimal Amount);
public record RefundResponse(string Message);
