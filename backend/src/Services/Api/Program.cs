using System.Text;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Yarp.ReverseProxy.Transforms;

var builder = WebApplication.CreateBuilder(args);

// 1. Skonfiguruj autentykację JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "auth-service",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "tab-app",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret missing")))
        };
    });

// 2. Skonfiguruj autoryzację (dodajemy domyślną polisę RequireJwt, z której skorzysta YARP)
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireJwt", policy =>
    {
        policy.RequireAuthenticatedUser();
    });
});

// 3. Dodaj YARP
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
    // 4. Transformacja wyciągająca role/sub i doklejająca nagłówki w locie dla docelowej mikrousługi
    //    Działa dla WSZYSTKICH tras, nawet tych bez AuthorizationPolicy (np. auth-route)
    //    przez ręczne parsowanie tokenu z nagłówka Authorization.
    .AddTransforms(builderContext =>
    {
        builderContext.AddRequestTransform(transformContext =>
        {
            var httpContext = transformContext.HttpContext;
            var user = httpContext.User;

            string? userId = null;
            string? role = null;

            // Sprawdź, czy middleware autentykacji już uwierzytelnił użytkownika
            if (user.Identity?.IsAuthenticated == true)
            {
                userId = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                role = user.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            }
            else
            {
                // Dla tras bez AuthorizationPolicy (np. auth-route) – ręczne parsowanie tokenu
                var authHeader = httpContext.Request.Headers["Authorization"].FirstOrDefault();
                if (authHeader?.StartsWith("Bearer ") == true)
                {
                    var token = authHeader["Bearer ".Length..].Trim();
                    try
                    {
                        var jwtSecret = builder.Configuration["Jwt:Secret"]!;
                        var validationParams = new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidateAudience = true,
                            ValidateLifetime = true,
                            ValidateIssuerSigningKey = true,
                            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "auth-service",
                            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "tab-app",
                            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
                        };

                        var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                        var principal = handler.ValidateToken(token, validationParams, out _);
                        userId = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                                 ?? principal.FindFirst("sub")?.Value;
                        role = principal.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value
                               ?? principal.FindFirst("role")?.Value;
                    }
                    catch
                    {
                        // Token nieprawidłowy – po prostu nie wstrzykujemy nagłówków
                    }
                }
            }

            // Wstrzyknij nagłówki do żądania downstream
            if (!string.IsNullOrEmpty(userId))
            {
                transformContext.ProxyRequest.Headers.Remove("X-User-Id");
                transformContext.ProxyRequest.Headers.Add("X-User-Id", userId);
            }

            if (!string.IsNullOrEmpty(role))
            {
                transformContext.ProxyRequest.Headers.Remove("X-User-Role");
                transformContext.ProxyRequest.Headers.Add("X-User-Role", role);
            }

            return ValueTask.CompletedTask;
        });
    });

var app = builder.Build();

app.MapGet("/gateway-health", () => "Gateway is running!");

// 5. Zastosuj middleware (kolejność ma znaczenie!)
app.UseAuthentication();
app.UseAuthorization();

app.MapReverseProxy();

app.Run();