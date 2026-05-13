using Microsoft.EntityFrameworkCore;
using ReportService.Data;
using ReportService.Consumers;
using MassTransit;
using Shared.Events;

// Npgsql 6+ breaking change fix: allow DateTime with Kind.Unspecified for timestamp columns
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetValue<string>("DATABASE_URL") 
    ?? builder.Configuration.GetConnectionString("ReportDb");

builder.Services.AddDbContext<ReportDbContext>(options =>
{
    if (connectionString != null && connectionString.StartsWith("postgres://"))
    {
        var uri = new Uri(connectionString);
        var userInfo = uri.UserInfo.Split(':');
        var dbName = uri.AbsolutePath.TrimStart('/');
        connectionString = $"Host={uri.Host};Port={(uri.Port > 0 ? uri.Port : 5432)};Database={dbName};Username={(userInfo.Length > 0 ? userInfo[0] : "postgres")};Password={(userInfo.Length > 1 ? userInfo[1] : "")}";
    }
    
    options.UseNpgsql(connectionString);
});

builder.Services.AddMassTransit(x =>
{
    x.SetKebabCaseEndpointNameFormatter();
    x.AddConsumer<OrderPurchasedReportConsumer>();
    x.AddConsumer<UserActivityReportConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitUrl = Environment.GetEnvironmentVariable("RABBITMQ_URL") ?? "amqp://guest:guest@localhost";
        cfg.Host(new Uri(rabbitUrl));
        cfg.ConfigureEndpoints(context);
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// app.UseHttpsRedirection(); // disabled – causes 405 in Docker HTTP-only environment

// Raport 1: Zestawienie sprzedaży szkoleń w zadanym okresie
app.MapGet("/reports/sales", async (DateTime? startDate, DateTime? endDate, Guid? courseId, HttpContext httpContext, ReportDbContext db) =>
{
    var role = httpContext.Request.Headers["X-User-Role"].FirstOrDefault();
    if (role != "Admin") return Results.Forbid();

    var query = db.CourseSales.AsQueryable();

    if (startDate.HasValue) query = query.Where(s => s.PurchasedAt >= startDate.Value);
    if (endDate.HasValue) query = query.Where(s => s.PurchasedAt <= endDate.Value);
    if (courseId.HasValue) query = query.Where(s => s.CourseId == courseId.Value);

    var sales = await query.ToListAsync();

    var report = sales.GroupBy(s => s.CourseId)
        .Select(g => new
        {
            CourseId = g.Key,
            AccessesSold = g.Count(),
            TotalRevenue = g.Sum(s => s.Price)
        })
        .ToList();

    return Results.Ok(report);
});

// Raport 2: Aktywność użytkowników na platformie
app.MapGet("/reports/activity", async (DateTime? startDate, DateTime? endDate, Guid? userId, HttpContext httpContext, ReportDbContext db) =>
{
    var role = httpContext.Request.Headers["X-User-Role"].FirstOrDefault();
    if (role != "Admin") return Results.Forbid();

    var query = db.UserActivities.AsQueryable();

    if (startDate.HasValue) query = query.Where(a => a.ActivityDate >= startDate.Value);
    if (endDate.HasValue) query = query.Where(a => a.ActivityDate <= endDate.Value);
    if (userId.HasValue) query = query.Where(a => a.UserId == userId.Value);

    var activities = await query.ToListAsync();

    var report = activities.GroupBy(a => a.UserId)
        .Select(g => new
        {
            UserId = g.Key,
            ForumPostsCount = g.Count(a => a.Type == ActivityType.ForumPost),
            GuestBookEntriesCount = g.Count(a => a.Type == ActivityType.GuestBookEntry),
            DownloadsCount = g.Count(a => a.Type == ActivityType.MaterialDownload)
        })
        .ToList();

    return Results.Ok(report);
});

// Zastosowanie migracji / utworzenie bazy na start
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ReportDbContext>();
    try 
    {
        db.Database.EnsureCreated(); // Prostsze niż migracje dla Report Db
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Could not create database: {ex.Message}");
    }
}

app.Run();

namespace Shared.Events
{
    public record CoursePurchasedIntegrationEvent(Guid UserId, Guid CourseId, decimal Amount);
    public record UserActivityIntegrationEvent(Guid UserId, string ActivityType);
}
