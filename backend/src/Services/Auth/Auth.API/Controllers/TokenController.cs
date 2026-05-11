using Auth.Application.Common.Interfaces;
using Auth.Application.DTO;
using Auth.Domain.Exceptions;

using Microsoft.AspNetCore.Mvc;

namespace Auth.API.Controllers;

[ApiController]
[Route("[controller]")]
public class TokenController : ControllerBase
{
    private readonly IAuthService _authService;

    public TokenController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request, CancellationToken ct)
    {
        try
        {
            var response = await _authService.RefreshAsync(request.RefreshToken, ct);
            return Ok(response);
        }
        catch (InvalidCredentialsException)
        {
            return Unauthorized("Invalid or expired refresh token.");
        }
    }

    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke([FromBody] RevokeRequest request, CancellationToken ct)
    {
        await _authService.RevokeAsync(request.RefreshToken, ct);
        return NoContent();
    }
}
