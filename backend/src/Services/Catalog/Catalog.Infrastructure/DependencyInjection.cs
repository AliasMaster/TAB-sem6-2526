using System;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using CatalogService.Domain.Enums;
using CatalogService.Domain.Interfaces;
using CatalogService.Infrastructure.Persistence;
using CatalogService.Infrastructure.Persistence.Repositories;

namespace CatalogService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration["DATABASE_URL"]
            ?? configuration.GetConnectionString("CatalogDb");

        if (connectionString != null && connectionString.StartsWith("postgres://"))
        {
            var uri = new Uri(connectionString);
            var userInfo = uri.UserInfo.Split(':');
            var dbName = uri.AbsolutePath.TrimStart('/');
            connectionString = $"Host={uri.Host};Port={(uri.Port > 0 ? uri.Port : 5432)};Database={dbName};Username={(userInfo.Length > 0 ? userInfo[0] : "postgres")};Password={(userInfo.Length > 1 ? userInfo[1] : "")}";
        }

        services.AddDbContext<CatalogDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MapEnum<CourseStatus>("course_status");
            });
        });

        services.AddScoped<ICourseRepository, CourseRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddMassTransit(x =>
        {
            x.SetKebabCaseEndpointNameFormatter();
            x.AddConsumer<Consumers.VideoProcessingCompletedConsumer>()
                .Endpoint(e => e.Name = "catalog-video-processing-completed");

            x.AddConsumer<Consumers.CoursePurchasedConsumer>()
                .Endpoint(e => e.Name = "catalog-course-purchased");

            x.AddConsumer<Consumers.CourseRefundedConsumer>()
                .Endpoint(e => e.Name = "catalog-course-refunded");

            x.UsingRabbitMq((context, cfg) =>
            {
                var rabbitUrl = Environment.GetEnvironmentVariable("RABBITMQ_URL") ?? "amqp://guest:guest@localhost";
                cfg.Host(new Uri(rabbitUrl));
                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }
}
