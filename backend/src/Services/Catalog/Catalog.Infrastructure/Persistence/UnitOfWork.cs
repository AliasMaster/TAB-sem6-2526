using System.Threading;
using System.Threading.Tasks;
using CatalogService.Domain.Interfaces;

namespace CatalogService.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly CatalogDbContext _db;

    public UnitOfWork(CatalogDbContext db)
    {
        _db = db;
    }

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        return await _db.SaveChangesAsync(ct);
    }
}
