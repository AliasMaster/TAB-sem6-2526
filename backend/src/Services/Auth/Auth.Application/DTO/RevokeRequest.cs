namespace Auth.Application.DTO;

public class RevokeRequest
{
    public required string RefreshToken { get; set; }
}
