namespace Auth.Application.Common.Interfaces;

using Auth.Application.DTO;

public interface IAuthService
{
    Task<Guid> RegisterAsync(string username, string password, string? requestedRole = null, string? callerRole = null, CancellationToken ct = default);
    Task<LoginResponse> LoginAsync(string username, string password, CancellationToken ct = default);
    Task<LoginResponse> RefreshAsync(string refreshToken, CancellationToken ct = default);
    Task RevokeAsync(string refreshToken, CancellationToken ct = default);
}