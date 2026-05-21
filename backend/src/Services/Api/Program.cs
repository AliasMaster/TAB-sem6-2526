using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var jwtSecret = builder.Configuration["Jwt__Secret"]
    ?? builder.Configuration["Jwt:Secret"]
    ?? "YourSuperSecretKeyThatIsAtLeast32CharactersLong_ChangeInProduction!";
var jwtIssuer = builder.Configuration["Jwt__Issuer"] ?? builder.Configuration["Jwt:Issuer"] ?? "auth-service";
var jwtAudience = builder.Configuration["Jwt__Audience"] ?? builder.Configuration["Jwt:Audience"] ?? "tab-app";

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:80", "http://localhost")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.UseCors();

// Middleware: silently extract claims from JWT (if valid) and inject as trusted headers.
// Requests without a token pass through unchanged — downstream services handle their own auth.
app.Use(async (context, next) =>
{
    var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
    if (authHeader != null && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
    {
        var token = authHeader.Substring("Bearer ".Length).Trim();
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var principal = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,
                ValidateAudience = true,
                ValidAudience = jwtAudience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(30)
            }, out _);

            var userId = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                      ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var role = principal.FindFirst(ClaimTypes.Role)?.Value
                    ?? principal.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;

            if (userId != null)
                context.Request.Headers["X-User-Id"] = userId;

            if (role != null)
            {
                var normalized = char.ToUpper(role[0]) + role.Substring(1).ToLower();
                context.Request.Headers["X-User-Role"] = normalized;
            }
        }
        catch
        {
            // Invalid/expired token — don't inject headers, let downstream handle it
        }
    }

    await next();
});

app.MapReverseProxy();
app.Run();
