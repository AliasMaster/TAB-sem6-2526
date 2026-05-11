namespace Auth.Application.Common.Interfaces;

using Auth.Domain.Entities;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    string HashRefreshToken(string refreshToken);
}
