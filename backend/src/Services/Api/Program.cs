using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// 1. Konfiguracja CORS (Kluczowe dla ciasteczek i Reacta)
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Adres Twojego Reacta
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Wymagane dla HttpOnly Cookies
    });
});

// 2. Dodanie YARP
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.UseCors("FrontendPolicy");

// 3. Mapowanie YARP
app.MapReverseProxy();

app.Run();