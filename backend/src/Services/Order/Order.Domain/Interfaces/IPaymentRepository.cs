using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Order.Domain.Entities;
using Order.Domain.Enums;

namespace Order.Domain.Interfaces;

public interface IPaymentRepository
{
    Task<Payment?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> AnyAsync(Guid userId, Guid courseId, PaymentStatus status, CancellationToken ct = default);
    Task AddAsync(Payment payment, CancellationToken ct = default);
    Task<List<Payment>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<List<Payment>> GetAllAsync(CancellationToken ct = default);
}
