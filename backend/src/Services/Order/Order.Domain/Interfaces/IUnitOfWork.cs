using System.Threading;
using System.Threading.Tasks;

namespace Order.Domain.Interfaces;

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
