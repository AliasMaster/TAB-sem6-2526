using Microsoft.Extensions.DependencyInjection;
using Community.Application.Common.Interfaces;
using Community.Application.Services;

namespace Community.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IWeatherService, WeatherService>();
        return services;
    }
}
