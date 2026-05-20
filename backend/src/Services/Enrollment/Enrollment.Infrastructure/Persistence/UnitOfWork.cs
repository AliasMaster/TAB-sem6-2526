using System.Threading;
using System.Threading.Tasks;
using EnrollmentService.Domain.Interfaces;

namespace EnrollmentService.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly EnrollmentDbContext _db;

    public UnitOfWork(EnrollmentDbContext db)
    {
        _db = db;
    }

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        return await _db.SaveChangesAsync(ct);
    }
}
