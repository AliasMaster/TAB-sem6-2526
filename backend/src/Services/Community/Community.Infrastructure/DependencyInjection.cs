using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using CommunityService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Community.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<CommunityDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("CommunityDb"),
                b => b.MigrationsAssembly(typeof(CommunityDbContext).Assembly.FullName)));

        return services;
    }
}
