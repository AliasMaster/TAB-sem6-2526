using CatalogService.Data;
using CatalogService.Endpoints;
using CatalogService.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetValue<string>("DATABASE_URL") 
    ?? builder.Configuration.GetConnectionString("CatalogDb");

builder.Services.AddDbContext<CatalogDbContext>(options =>
{
    // Jeśli DATABASE_URL ma format postgres://... (z docker-compose), zamień na standardowy connection string
    if (connectionString != null && connectionString.StartsWith("postgres://"))
    {
        var uri = new Uri(connectionString);
        var userInfo = uri.UserInfo.Split(':');
        var dbName = uri.AbsolutePath.TrimStart('/');
        connectionString = $"Host={uri.Host};Port={(uri.Port > 0 ? uri.Port : 5432)};Database={dbName};Username={(userInfo.Length > 0 ? userInfo[0] : "postgres")};Password={(userInfo.Length > 1 ? userInfo[1] : "")}";
    }
    
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.MapEnum<CourseStatus>("course_status");
        npgsqlOptions.MapEnum<EnrollmentStatus>("enrollment_status");
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Map Endpoints
app.MapCourseEndpoints();

// Apply migrations on startup (optional for development, but good for demo)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CatalogDbContext>();
    try 
    {
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Could not migrate database: {ex.Message}");
    }
}

app.Run();
