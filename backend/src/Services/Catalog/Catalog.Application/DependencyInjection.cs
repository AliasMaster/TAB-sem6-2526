using Microsoft.Extensions.DependencyInjection;
using CatalogService.Application.Common.Interfaces;
using CatalogService.Application.Services;

namespace CatalogService.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ICourseService, CourseService>();
        return services;
    }
}
