using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Order.Application.DTOs;
using Order.Domain.Entities;

namespace Order.Application.Common.Interfaces;

public interface IOrderService
{
    Task<Payment> PurchaseAsync(Guid userId, PurchaseRequest request, CancellationToken ct = default);
    Task<Payment> ProcessPaymentAsync(Guid paymentId, CancellationToken ct = default);
    Task<RefundResponse> RefundAsync(Guid id, string? role, Guid? userId, CancellationToken ct = default);
    Task<List<Payment>> GetMyPaymentsAsync(Guid userId, CancellationToken ct = default);
    Task<List<Payment>> GetAllPaymentsAsync(string? role, CancellationToken ct = default);
}
