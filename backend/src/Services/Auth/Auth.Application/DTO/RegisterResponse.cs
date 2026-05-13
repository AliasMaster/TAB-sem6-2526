namespace Auth.Application.DTO;

public class RegisterResponse
{
    public required string UserId { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
}