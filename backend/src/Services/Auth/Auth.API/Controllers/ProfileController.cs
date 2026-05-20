using Auth.Application.Common.Interfaces;
using Auth.Application.DTO;
using Auth.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Auth.API.Controllers;

[ApiController]
[Route("profile")]
public class ProfileController : ControllerBase
{
    private readonly IAuthService _authService;

    public ProfileController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            await _authService.ChangePasswordAsync(userId, request.OldPassword, request.NewPassword, ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidCredentialsException)
        {
            return BadRequest(new { Message = "Błędne aktualne hasło." });
        }
    }
}
