using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Order.Domain.Entities;
using Order.Domain.Enums;
using Order.Domain.Interfaces;

namespace Order.Infrastructure.Persistence.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly OrderDbContext _db;

    public PaymentRepository(OrderDbContext db)
    {
        _db = db;
    }

    public async Task<Payment?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _db.Payments.FindAsync(new object[] { id }, ct);
    }

    public async Task<bool> AnyAsync(Guid userId, Guid courseId, PaymentStatus status, CancellationToken ct = default)
    {
        return await _db.Payments.AnyAsync(p => p.UserId == userId && p.CourseId == courseId && p.Status == status, ct);
    }

    public async Task AddAsync(Payment payment, CancellationToken ct = default)
    {
        await _db.Payments.AddAsync(payment, ct);
    }

    public async Task<List<Payment>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        return await _db.Payments
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<List<Payment>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Payments
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);
    }
}
