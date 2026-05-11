using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.Models;
using OrderService.DTOs;
using MassTransit;
using Shared.Events;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetValue<string>("DATABASE_URL") 
    ?? builder.Configuration.GetConnectionString("OrderDb");

builder.Services.AddDbContext<OrderDbContext>(options =>
{
    if (connectionString != null && connectionString.StartsWith("postgres://"))
    {
        var uri = new Uri(connectionString);
        var userInfo = uri.UserInfo.Split(':');
        var dbName = uri.AbsolutePath.TrimStart('/');
        connectionString = $"Host={uri.Host};Port={(uri.Port > 0 ? uri.Port : 5432)};Database={dbName};Username={(userInfo.Length > 0 ? userInfo[0] : "postgres")};Password={(userInfo.Length > 1 ? userInfo[1] : "")}";
    }
    
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.MapEnum<PaymentStatus>("payment_status");
    });
});

builder.Services.AddMassTransit(x =>
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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Purchase Endpoint
app.MapPost("/purchase", async (PurchaseRequest request, HttpContext httpContext, OrderDbContext db, IPublishEndpoint publishEndpoint) =>
{
    var userIdStr = httpContext.Request.Headers["X-User-Id"].FirstOrDefault();
    if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

    // Check if already purchased
    var alreadyPurchased = await db.Payments
        .AnyAsync(p => p.UserId == userId && p.CourseId == request.CourseId && p.Status == PaymentStatus.Completed);
    
    if (alreadyPurchased)
    {
        return Results.BadRequest(new { message = "You already have access to this course." });
    }

    var payment = new Payment
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        CourseId = request.CourseId,
        Amount = request.Amount,
        Status = PaymentStatus.Completed, // Simulating instant success
        CreatedAt = DateTime.UtcNow
    };

    db.Payments.Add(payment);
    await db.SaveChangesAsync();

    // Publish event
    await publishEndpoint.Publish(new CoursePurchasedIntegrationEvent(userId, request.CourseId));

    return Results.Ok(payment);
});

// Refund Endpoint
app.MapPost("/refund/{id:guid}", async (Guid id, HttpContext httpContext, OrderDbContext db, IPublishEndpoint publishEndpoint) =>
{
    var role = httpContext.Request.Headers["X-User-Role"].FirstOrDefault();
    var userIdStr = httpContext.Request.Headers["X-User-Id"].FirstOrDefault();
    
    var payment = await db.Payments.FindAsync(id);
    if (payment == null) return Results.NotFound();

    // Only Admin or the User who paid can refund (in a real app, maybe only Admin/Support)
    if (role != "Admin" && (!Guid.TryParse(userIdStr, out var userId) || payment.UserId != userId))
    {
        return Results.Forbid();
    }

    if (payment.Status == PaymentStatus.Refunded) return Results.BadRequest("Already refunded");

    payment.Status = PaymentStatus.Refunded;
    await db.SaveChangesAsync();

    // Publish event
    await publishEndpoint.Publish(new CourseRefundedIntegrationEvent(payment.UserId, payment.CourseId));

    return Results.Ok(new RefundResponse("Payment refunded successfully"));
});

// GET My Payments
app.MapGet("/my", async (HttpContext httpContext, OrderDbContext db) =>
{
    var userIdStr = httpContext.Request.Headers["X-User-Id"].FirstOrDefault();
    if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

    var payments = await db.Payments
        .Where(p => p.UserId == userId)
        .OrderByDescending(p => p.CreatedAt)
        .ToListAsync();

    return Results.Ok(payments);
});

// GET All Payments (Admin)
app.MapGet("/all", async (HttpContext httpContext, OrderDbContext db) =>
{
    var role = httpContext.Request.Headers["X-User-Role"].FirstOrDefault();
    if (role != "Admin") return Results.Forbid();

    var payments = await db.Payments
        .OrderByDescending(p => p.CreatedAt)
        .ToListAsync();

    return Results.Ok(payments);
});

app.Run();

namespace Shared.Events
{
    public record CoursePurchasedIntegrationEvent(Guid UserId, Guid CourseId);
    public record CourseRefundedIntegrationEvent(Guid UserId, Guid CourseId);
}
