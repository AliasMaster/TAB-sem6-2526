using Microsoft.EntityFrameworkCore;
using CommunityService.Data;
using MassTransit;
using Shared.Events;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetValue<string>("DATABASE_URL") 
    ?? builder.Configuration.GetConnectionString("CommunityDb");

builder.Services.AddDbContext<CommunityDbContext>(options =>
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
    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitUrl = Environment.GetEnvironmentVariable("RABBITMQ_URL") ?? "amqp://guest:guest@localhost";
        cfg.Host(new Uri(rabbitUrl));
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// 1. Dodanie posta na forum
app.MapPost("/forum/{courseId:guid}", async (Guid courseId, PostDto request, HttpContext httpContext, CommunityDbContext db, IPublishEndpoint publishEndpoint) =>
{
    var userIdStr = httpContext.Request.Headers["X-User-Id"].FirstOrDefault();
    if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

    var post = new ForumPost
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        CourseId = courseId,
        Content = request.Content,
        CreatedAt = DateTime.UtcNow
    };

    db.ForumPosts.Add(post);
    await db.SaveChangesAsync();

    await publishEndpoint.Publish(new UserActivityIntegrationEvent(userId, "ForumPost"));

    return Results.Ok(post);
});

// 2. Dodanie wpisu do księgi gości
app.MapPost("/guestbook", async (PostDto request, HttpContext httpContext, CommunityDbContext db, IPublishEndpoint publishEndpoint) =>
{
    var userIdStr = httpContext.Request.Headers["X-User-Id"].FirstOrDefault();
    if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

    var entry = new GuestBookEntry
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        Content = request.Content,
        CreatedAt = DateTime.UtcNow
    };

    db.GuestBookEntries.Add(entry);
    await db.SaveChangesAsync();

    await publishEndpoint.Publish(new UserActivityIntegrationEvent(userId, "GuestBookEntry"));

    return Results.Ok(entry);
});

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CommunityDbContext>();
    try 
    {
        db.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Could not create database: {ex.Message}");
    }
}

app.Run();

public record PostDto(string Content);

namespace Shared.Events
{
    public record UserActivityIntegrationEvent(Guid UserId, string ActivityType);
}
