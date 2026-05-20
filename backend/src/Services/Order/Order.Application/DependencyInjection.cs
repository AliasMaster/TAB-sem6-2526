using Microsoft.Extensions.DependencyInjection;
using Order.Application.Common.Interfaces;
using Order.Application.Services;

namespace Order.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IOrderService, OrderService>();
        return services;
    }
}
