namespace Auth.Application.DTO;

public class LoginResponse
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public required DateTime ExpiresAt { get; set; }
}