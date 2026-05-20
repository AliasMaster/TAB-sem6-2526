using Microsoft.Extensions.DependencyInjection;
using Report.Application.Common.Interfaces;
using Report.Application.Services;

namespace Report.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IReportService, ReportService>();
        return services;
    }
}
