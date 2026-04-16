using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using AuthService.Data;
using AuthService.Models;
using BCrypt.Net;

var builder = WebApplication.CreateBuilder(args);

// 1. Połączenie z bazą
var dbUrl = Environment.GetEnvironmentVariable("DATABASE_URL") 
            ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AuthDbContext>(options => options.UseNpgsql(dbUrl));

var app = builder.Build();

// Klucz musi być identyczny w loginie, rejestracji i metodzie /me!
const string JwtKey = "TwojSuperTajnyKluczDoJWTMusiMiecMinimum32Znaki!";

// --- FUNKCJA GENERUJĄCA TOKEN ---
string GenerateJwtToken(User user)
{
    var tokenHandler = new JwtSecurityTokenHandler();
    var key = Encoding.ASCII.GetBytes(JwtKey);
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Login)
        }),
        Expires = DateTime.UtcNow.AddHours(2),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
    };
    var token = tokenHandler.CreateToken(tokenDescriptor);
    return tokenHandler.WriteToken(token);
}

// Opcje ciasteczek - wydzielone, by były identyczne wszędzie
var globalCookieOptions = new CookieOptions
{
    HttpOnly = true,
    Secure = false, // false dla http://localhost
    SameSite = SameSiteMode.Lax, 
    Expires = DateTime.UtcNow.AddHours(2),
    Path = "/"
};

// --- ENDPOINTY ---

app.MapPost("/register", async (RegisterRequest request, AuthDbContext context, HttpContext httpContext) =>
{
    if (await context.Users.AnyAsync(u => u.Login == request.Login))
        return Results.BadRequest("Użytkownik z takim loginem już istnieje");

    if (!string.IsNullOrEmpty(request.Email) && await context.Users.AnyAsync(u => u.Email == request.Email))
        return Results.BadRequest("Użytkownik z takim adresem email już istnieje");

    var newUser = new User
    {
        Id = Guid.NewGuid(),
        Login = request.Login,
        Email = request.Email,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
        Role = "User"
    };

    context.Users.Add(newUser);
    await context.SaveChangesAsync();

    // AUTOMATYCZNE LOGOWANIE PO REJESTRACJI
    var token = GenerateJwtToken(newUser);
    httpContext.Response.Cookies.Append("auth_token", token, globalCookieOptions);

    return Results.Ok(new { id = newUser.Id, login = newUser.Login, role = newUser.Role, email = newUser.Email });
});

app.MapPost("/login", async (LoginRequest request, AuthDbContext context, HttpContext httpContext) =>
{
    var user = await context.Users.FirstOrDefaultAsync(u => u.Login == request.Identifier || u.Email == request.Identifier);
            
    if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        return Results.Json(new { message = "Błędny login lub hasło" }, statusCode: 401);

    var token = GenerateJwtToken(user);
    httpContext.Response.Cookies.Append("auth_token", token, globalCookieOptions);

    return Results.Ok(new { id = user.Id, login = user.Login, role = user.Role, email = user.Email });
});

app.MapGet("/me", async (HttpContext httpContext, AuthDbContext context) =>
{
    var token = httpContext.Request.Cookies["auth_token"];
    if (string.IsNullOrEmpty(token)) return Results.Unauthorized();

    var tokenHandler = new JwtSecurityTokenHandler();
    var key = Encoding.ASCII.GetBytes(JwtKey);

    try
    {
        tokenHandler.ValidateToken(token, new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        }, out SecurityToken validatedToken);

        var jwtToken = (JwtSecurityToken)validatedToken;
        var userIdString = jwtToken.Claims.First(x => x.Type == JwtRegisteredClaimNames.Sub).Value;
        
        if (Guid.TryParse(userIdString, out Guid userId))
        {
            var user = await context.Users.FindAsync(userId);
            if (user != null)
            {
                return Results.Ok(new { id = user.Id, login = user.Login, role = user.Role, email = user.Email, profilePic = user.ProfilePic });
            }
        }
        return Results.Unauthorized();
    }
    catch { return Results.Unauthorized(); }
});

app.MapPost("/logout", (HttpContext httpContext) =>
{
    httpContext.Response.Cookies.Append("auth_token", "", new CookieOptions
    {
        HttpOnly = true,
        Secure = false, 
        SameSite = SameSiteMode.Lax,
        Expires = DateTime.UtcNow.AddYears(-1),
        Path = "/"
    });
    return Results.Ok();
});


app.MapPut("/update", async (UpdateProfileRequest request, AuthDbContext context) =>
{
    var user = await context.Users.FindAsync(request.Id);
    if (user == null) return Results.NotFound("Nie znaleziono użytkownika.");

    // Aktualizacja Loginu
    if (!string.IsNullOrEmpty(request.NewLogin) && request.NewLogin != user.Login)
    {
        if (await context.Users.AnyAsync(u => u.Login == request.NewLogin))
            return Results.BadRequest("Ten login jest już zajęty.");
        user.Login = request.NewLogin;
    }

    // Aktualizacja Hasła
    if (!string.IsNullOrEmpty(request.NewPassword))
    {
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
    }

    // Aktualizacja Email
    if (!string.IsNullOrEmpty(request.NewEmail) && request.NewEmail != user.Email)
    {
         if (await context.Users.AnyAsync(u => u.Email == request.NewEmail))
            return Results.BadRequest("Ten email jest już zajęty.");
         user.Email = request.NewEmail;
    }

    // Aktualizacja Avatara 
    if (!string.IsNullOrEmpty(request.NewProfilePic))
    {
        user.ProfilePic = request.NewProfilePic;
    }

    await context.SaveChangesAsync();
    return Results.Ok(new { message = "Profil zaktualizowany" });
});
app.Run();

// --- KLASY DTO ---
public class RegisterRequest 
{ 
    public string Login { get; set; } 
    public string Email { get; set; } // DODANE: Wymagane, aby przechwycić maila z Reacta!
    public string Password { get; set; } 
}

public class LoginRequest 
{ 
    public string Identifier { get; set; } 
    public string Password { get; set; } 
}

public class UpdateProfileRequest 
{ 
    public Guid Id { get; set; } 
    public string? NewLogin { get; set; } 
    public string? NewEmail { get; set; } 
    public string? NewPassword { get; set; } 
    public string? NewProfilePic { get; set; } 
}