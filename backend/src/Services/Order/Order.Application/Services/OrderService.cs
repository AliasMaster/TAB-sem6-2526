using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MassTransit;
using Order.Application.Common.Interfaces;
using Order.Application.DTOs;
using Order.Domain.Entities;
using Order.Domain.Enums;
using Order.Domain.Interfaces;
using Shared.Events;

namespace Order.Application.Services;

public class OrderService : IOrderService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPublishEndpoint _publishEndpoint;

    public OrderService(
        IPaymentRepository paymentRepository,
        IUnitOfWork unitOfWork,
        IPublishEndpoint publishEndpoint)
    {
        _paymentRepository = paymentRepository;
        _unitOfWork = unitOfWork;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Payment> PurchaseAsync(Guid userId, PurchaseRequest request, CancellationToken ct = default)
    {
        // Check if already purchased
        var alreadyPurchased = await _paymentRepository.AnyAsync(userId, request.CourseId, PaymentStatus.Completed, ct);
        if (alreadyPurchased)
        {
            throw new InvalidOperationException("You already have access to this course.");
        }

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CourseId = request.CourseId,
            Amount = request.Amount,
            Status = PaymentStatus.Pending, // Purchase intent
            CreatedAt = DateTime.UtcNow
        };

        await _paymentRepository.AddAsync(payment, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return payment;
    }

    public async Task<Payment> ProcessPaymentAsync(Guid paymentId, CancellationToken ct = default)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId, ct);
        if (payment == null)
        {
            throw new KeyNotFoundException("Payment not found");
        }

        if (payment.Status == PaymentStatus.Completed)
        {
            return payment;
        }

        payment.Status = PaymentStatus.Completed;
        await _unitOfWork.SaveChangesAsync(ct);

        // Publish event
        await _publishEndpoint.Publish(new CoursePurchasedIntegrationEvent(payment.UserId, payment.CourseId), ct);

        return payment;
    }

    public async Task<RefundResponse> RefundAsync(Guid id, string? role, Guid? userId, CancellationToken ct = default)
    {
        var payment = await _paymentRepository.GetByIdAsync(id, ct);
        if (payment == null)
        {
            throw new KeyNotFoundException("Payment not found");
        }

        // Only Admin or the User who paid can refund
        if (role != "Admin" && (!userId.HasValue || payment.UserId != userId.Value))
        {
            throw new UnauthorizedAccessException("Forbidden");
        }

        if (payment.Status == PaymentStatus.Refunded)
        {
            throw new InvalidOperationException("Already refunded");
        }

        if ((DateTime.UtcNow - payment.CreatedAt).TotalDays > 14)
        {
            throw new InvalidOperationException("Refund period has expired (14 days max).");
        }

        payment.Status = PaymentStatus.Refunded;
        await _unitOfWork.SaveChangesAsync(ct);

        // Publish event
        await _publishEndpoint.Publish(new CourseRefundedIntegrationEvent(payment.UserId, payment.CourseId), ct);

        return new RefundResponse("Payment refunded successfully");
    }

    public async Task<List<Payment>> GetMyPaymentsAsync(Guid userId, CancellationToken ct = default)
    {
        return await _paymentRepository.GetByUserIdAsync(userId, ct);
    }

    public async Task<List<Payment>> GetAllPaymentsAsync(string? role, CancellationToken ct = default)
    {
        if (role != "Admin")
        {
            throw new UnauthorizedAccessException("Forbidden");
        }

        return await _paymentRepository.GetAllAsync(ct);
    }
}
