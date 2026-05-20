using Microsoft.Extensions.DependencyInjection;
using EnrollmentService.Application.Common.Interfaces;
using EnrollmentService.Application.Services;

namespace EnrollmentService.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IEnrollmentService, Services.EnrollmentService>();
        return services;
    }
}
