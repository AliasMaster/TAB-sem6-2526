using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Report.Domain.Interfaces;
using Report.Infrastructure.Persistence;

namespace Report.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration["DATABASE_URL"]
            ?? configuration.GetConnectionString("ReportDb");

        if (connectionString != null && connectionString.StartsWith("postgres://"))
        {
            var uri = new Uri(connectionString);
            var userInfo = uri.UserInfo.Split(':');
            var dbName = uri.AbsolutePath.TrimStart('/');
            connectionString =
                $"Host={uri.Host};Port={(uri.Port > 0 ? uri.Port : 5432)};" +
                $"Database={dbName};" +
                $"Username={(userInfo.Length > 0 ? userInfo[0] : "postgres")};" +
                $"Password={(userInfo.Length > 1 ? userInfo[1] : "")}";
        }

        services.AddDbContext<ReportDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IReportQueries, ReportQueries>();

        return services;
    }
}
