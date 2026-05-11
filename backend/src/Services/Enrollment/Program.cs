using Microsoft.EntityFrameworkCore;
using EnrollmentService.Data;
using EnrollmentService.Models;
using EnrollmentService.Consumers;
using MassTransit;
using Shared.Events;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetValue<string>("DATABASE_URL") 
    ?? builder.Configuration.GetConnectionString("EnrollmentDb");

builder.Services.AddDbContext<EnrollmentDbContext>(options =>
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
        npgsqlOptions.MapEnum<EnrollmentStatus>("enrollment_status");
    });
});

builder.Services.AddMassTransit(x =>
{
    x.SetKebabCaseEndpointNameFormatter();
    x.AddConsumer<CoursePurchasedConsumer>();
    x.AddConsumer<CourseRefundedConsumer>();
    x.AddConsumer<VideoProcessingCompletedConsumer>(); // NOWY KONSUMENT

    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitUrl = Environment.GetEnvironmentVariable("RABBITMQ_URL") ?? "amqp://guest:guest@localhost";
        cfg.Host(new Uri(rabbitUrl));
        cfg.ConfigureEndpoints(context);
    });
});

builder.Services.AddHttpClient("CatalogService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration.GetValue<string>("CATALOG_SERVICE_URL") ?? "http://catalog-service:8080");
});

builder.Services.AddHttpClient("FileStorage", client =>
{
    client.BaseAddress = new Uri(builder.Configuration.GetValue<string>("FILE_STORAGE_URL") ?? "http://file-storage-service:8080");
    client.Timeout = TimeSpan.FromMinutes(10);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapGet("/my", async (HttpContext httpContext, EnrollmentDbContext db) =>
{
    var userIdStr = httpContext.Request.Headers["X-User-Id"].FirstOrDefault();
    if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

    var enrollments = await db.Enrollments
        .Where(e => e.UserId == userId && e.Status == EnrollmentStatus.Active)
        .ToListAsync();

    return Results.Ok(enrollments);
});

app.MapGet("/course/{courseId:guid}/lessons", async (Guid courseId, HttpContext httpContext, EnrollmentDbContext db, IHttpClientFactory httpClientFactory) =>
{
    var userIdStr = httpContext.Request.Headers["X-User-Id"].FirstOrDefault();
    if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

    var role = httpContext.Request.Headers["X-User-Role"].FirstOrDefault();
    var hasEnrollment = await db.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == courseId && e.Status == EnrollmentStatus.Active);
    
    bool isAdmin = string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase) || string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase);
    
    if (!hasEnrollment && !isAdmin) return Results.StatusCode(403);

    var client = httpClientFactory.CreateClient("CatalogService");
    var request = new HttpRequestMessage(HttpMethod.Get, $"/courses/{courseId}/materials");
    foreach (var header in httpContext.Request.Headers)
    {
        if (header.Key.StartsWith("X-User-"))
        {
            request.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
        }
    }

    var response = await client.SendAsync(request);
    if (!response.IsSuccessStatusCode) return Results.StatusCode((int)response.StatusCode);

    var materials = await response.Content.ReadFromJsonAsync<List<CourseMaterialDto>>();
    return Results.Ok(materials);
});

app.MapGet("/course/{courseId:guid}/lesson/{lessonId:guid}/content", async (Guid courseId, Guid lessonId, HttpContext httpContext, EnrollmentDbContext db, IHttpClientFactory httpClientFactory) =>
{
    var userIdStr = httpContext.Request.Headers["X-User-Id"].FirstOrDefault();
    if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

    var role = httpContext.Request.Headers["X-User-Role"].FirstOrDefault();
    var hasEnrollment = await db.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == courseId && e.Status == EnrollmentStatus.Active);
    
    bool isAdmin = string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase) || string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase);
    
    if (!hasEnrollment && !isAdmin) return Results.StatusCode(403);

    var catalogClient = httpClientFactory.CreateClient("CatalogService");
    var materialsResponse = await catalogClient.GetAsync($"/courses/{courseId}/materials"); 
    if (!materialsResponse.IsSuccessStatusCode) return Results.StatusCode((int)materialsResponse.StatusCode);

    var materials = await materialsResponse.Content.ReadFromJsonAsync<List<CourseMaterialDto>>();
    var lesson = materials?.FirstOrDefault(m => m.Id == lessonId);
    
    if (lesson == null) return Results.NotFound();

    var fileClient = httpClientFactory.CreateClient("FileStorage");
    
    // Jeśli plik to m3u8 (HLS), pobieramy go bezpośrednio. Jeśli to segment .ts, też go przekazujemy.
    var fileUrl = $"/files/{lesson.ContentUrl}";
    var fileRequest = new HttpRequestMessage(HttpMethod.Get, fileUrl);
    
    if (httpContext.Request.Headers.TryGetValue("Range", out var range))
    {
        fileRequest.Headers.Add("Range", range.ToString());
    }

    var fileResponse = await fileClient.SendAsync(fileRequest, HttpCompletionOption.ResponseHeadersRead);
    
    if (!fileResponse.IsSuccessStatusCode && fileResponse.StatusCode != System.Net.HttpStatusCode.PartialContent)
    {
        return Results.StatusCode((int)fileResponse.StatusCode);
    }

    var contentType = fileResponse.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";
    var responseStream = await fileResponse.Content.ReadAsStreamAsync();

    foreach (var header in fileResponse.Headers)
    {
        httpContext.Response.Headers.TryAdd(header.Key, header.Value.ToArray());
    }
    foreach (var header in fileResponse.Content.Headers)
    {
        httpContext.Response.Headers.TryAdd(header.Key, header.Value.ToArray());
    }

    if (fileResponse.StatusCode == System.Net.HttpStatusCode.PartialContent)
    {
        httpContext.Response.StatusCode = 206;
    }

    return Results.Stream(responseStream, contentType, enableRangeProcessing: true);
});

app.Run();

public record CourseMaterialDto(Guid Id, string Title, string ContentUrl, int Order);

namespace Shared.Events
{
    public record VideoProcessingStartedEvent(Guid JobId);
    public record VideoProcessingProgressEvent(Guid JobId, int Progress);
    public record VideoProcessingCompletedEvent(Guid JobId, string HlsUrl);
    public record VideoProcessingFailedEvent(Guid JobId, string Error);

    public record CoursePurchasedIntegrationEvent(Guid UserId, Guid CourseId);
    public record CourseRefundedIntegrationEvent(Guid UserId, Guid CourseId);
}
