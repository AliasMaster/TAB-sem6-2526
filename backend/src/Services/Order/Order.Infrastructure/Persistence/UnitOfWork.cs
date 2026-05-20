using System.Threading;
using System.Threading.Tasks;
using Order.Domain.Interfaces;

namespace Order.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly OrderDbContext _db;

    public UnitOfWork(OrderDbContext db)
    {
        _db = db;
    }

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        return await _db.SaveChangesAsync(ct);
    }
}
