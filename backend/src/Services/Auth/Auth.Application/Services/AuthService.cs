using Auth.Application.Common.Interfaces;
using Auth.Application.DTO;
using Auth.Domain.Entities;
using Auth.Domain.Enums;
using Auth.Domain.Exceptions;
using Auth.Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Auth.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository, 
        IPasswordHasher passwordHasher, 
        IUnitOfWork unitOfWork,
        IRefreshTokenRepository refreshTokenRepository,
        IJwtTokenGenerator jwtTokenGenerator,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _unitOfWork = unitOfWork;
        _refreshTokenRepository = refreshTokenRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _configuration = configuration;
    }

    public async Task<Guid> RegisterAsync(string username, string password, string? requestedRole = null, string? callerRole = null, CancellationToken ct = default)
    {
        if(await _userRepository.ExistsAsync(username, ct))
        {
            throw new UserAlreadyExistsException();
        }

        UserRole roleToAssign = UserRole.User;

        if (!string.IsNullOrWhiteSpace(requestedRole))
        {
            if (Enum.TryParse<UserRole>(requestedRole, true, out var parsedRole))
            {
                if (parsedRole == UserRole.Admin || parsedRole == UserRole.Company)
                {
                    if (callerRole?.Equals("admin", StringComparison.OrdinalIgnoreCase) != true)
                    {
                        throw new UnauthorizedAccessException("Tylko administrator może tworzyć konta o randze Admin lub Company.");
                    }
                }
                roleToAssign = parsedRole;
            }
        }

        var hashedPassword = _passwordHasher.HashPassword(password);
        var newUser = new Domain.Entities.User
        {
            Id = Guid.NewGuid(),
            Login = username,
            PasswordHash = hashedPassword,
            Role = roleToAssign
        };

        await _userRepository.AddAsync(newUser, ct);

        await _unitOfWork.SaveChangesAsync(ct);

        return newUser.Id;
    }

    public async Task<LoginResponse> LoginAsync(string username, string password, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByLoginAsync(username, ct);
        
        if (user is null || !_passwordHasher.Verify(password, user.PasswordHash))
        {
            throw new InvalidCredentialsException();
        }

        return await GenerateTokenPairAsync(user, ct);
    }

    public async Task<LoginResponse> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        var hash = _jwtTokenGenerator.HashRefreshToken(refreshToken);
        var storedToken = await _refreshTokenRepository.GetByHashAsync(hash, ct);

        if (storedToken is null)
        {
            throw new InvalidCredentialsException(); // Invalid token
        }

        if (storedToken.IsRevoked || storedToken.ExpiresAt < DateTime.UtcNow)
        {
            throw new InvalidCredentialsException(); // Token expired or revoked
        }

        // Token is valid. Revoke it and generate a new one (Rotation)
        storedToken.IsRevoked = true;
        
        return await GenerateTokenPairAsync(storedToken.User, ct);
    }

    public async Task RevokeAsync(string refreshToken, CancellationToken ct = default)
    {
        var hash = _jwtTokenGenerator.HashRefreshToken(refreshToken);
        var storedToken = await _refreshTokenRepository.GetByHashAsync(hash, ct);

        if (storedToken is not null)
        {
            storedToken.IsRevoked = true;
            await _unitOfWork.SaveChangesAsync(ct);
        }
    }

    private async Task<LoginResponse> GenerateTokenPairAsync(User user, CancellationToken ct)
    {
        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user);
        var refreshTokenStr = _jwtTokenGenerator.GenerateRefreshToken();
        
        var expiryDays = int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7");
        var refreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = _jwtTokenGenerator.HashRefreshToken(refreshTokenStr),
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        };

        await _refreshTokenRepository.AddAsync(refreshTokenEntity, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        var accessTokenExpiryMinutes = int.Parse(_configuration["Jwt:AccessTokenExpiryMinutes"] ?? "15");

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenStr,
            ExpiresAt = DateTime.UtcNow.AddMinutes(accessTokenExpiryMinutes)
        };
    }
}