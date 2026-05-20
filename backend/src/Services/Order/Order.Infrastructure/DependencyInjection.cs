using System;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Order.Domain.Enums;
using Order.Domain.Interfaces;
using Order.Infrastructure.Persistence;
using Order.Infrastructure.Persistence.Repositories;

namespace Order.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration["DATABASE_URL"]
            ?? configuration.GetConnectionString("OrderDb");

        if (connectionString != null && connectionString.StartsWith("postgres://"))
        {
            var uri = new Uri(connectionString);
            var userInfo = uri.UserInfo.Split(':');
            var dbName = uri.AbsolutePath.TrimStart('/');
            connectionString = $"Host={uri.Host};Port={(uri.Port > 0 ? uri.Port : 5432)};Database={dbName};Username={(userInfo.Length > 0 ? userInfo[0] : "postgres")};Password={(userInfo.Length > 1 ? userInfo[1] : "")}";
        }

        services.AddDbContext<OrderDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MapEnum<PaymentStatus>("payment_status");
            });
        });

        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddMassTransit(x =>
        {
            x.UsingRabbitMq((context, cfg) =>
            {
                var rabbitUrl = Environment.GetEnvironmentVariable("RABBITMQ_URL");
                if (string.IsNullOrEmpty(rabbitUrl))
                {
                    rabbitUrl = "amqp://guest:guest@localhost";
                }

                cfg.Host(new Uri(rabbitUrl));
                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }
}
