using System.Threading;
using System.Threading.Tasks;

namespace CatalogService.Domain.Interfaces;

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
