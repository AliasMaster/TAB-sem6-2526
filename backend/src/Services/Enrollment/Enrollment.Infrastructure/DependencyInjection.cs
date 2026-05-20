using System;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using EnrollmentService.Domain.Enums;
using EnrollmentService.Domain.Interfaces;
using EnrollmentService.Infrastructure.Persistence;
using EnrollmentService.Infrastructure.Persistence.Repositories;
using EnrollmentService.Infrastructure.Consumers;

namespace EnrollmentService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration["DATABASE_URL"]
            ?? configuration.GetConnectionString("EnrollmentDb");

        if (connectionString != null && connectionString.StartsWith("postgres://"))
        {
            var uri = new Uri(connectionString);
            var userInfo = uri.UserInfo.Split(':');
            var dbName = uri.AbsolutePath.TrimStart('/');
            connectionString = $"Host={uri.Host};Port={(uri.Port > 0 ? uri.Port : 5432)};Database={dbName};Username={(userInfo.Length > 0 ? userInfo[0] : "postgres")};Password={(userInfo.Length > 1 ? userInfo[1] : "")}";
        }

        services.AddDbContext<EnrollmentDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MapEnum<EnrollmentStatus>("enrollment_status");
            });
        });

        services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddHttpClient("CatalogService", client =>
        {
            client.BaseAddress = new Uri(configuration["CATALOG_SERVICE_URL"] ?? "http://catalog-service:8080");
        });

        services.AddHttpClient("FileStorage", client =>
        {
            client.BaseAddress = new Uri(configuration["FILE_STORAGE_URL"] ?? "http://file-storage-service:8080");
            client.Timeout = TimeSpan.FromMinutes(10);
        });

        services.AddMassTransit(x =>
        {
            x.SetKebabCaseEndpointNameFormatter();
            x.AddConsumer<CoursePurchasedConsumer>();
            x.AddConsumer<CourseRefundedConsumer>();
            x.AddConsumer<VideoProcessingCompletedConsumer>()
                .Endpoint(e => e.Name = "enrollment-video-processing-completed");

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
