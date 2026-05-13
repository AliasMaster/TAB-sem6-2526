using Auth.Application.Common.Interfaces;
using Auth.Application.DTO;
using Auth.Domain.Exceptions;

using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")]
public class RegisterController : ControllerBase
{
    private readonly IAuthService _authService;

    public RegisterController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        try
        {
            var callerRole = Request.Headers["X-User-Role"].FirstOrDefault();
            var userId = await _authService.RegisterAsync(request.Username, request.Password, request.Role, callerRole, ct);
            return Ok(new { UserId = userId });
        }
        catch (UserAlreadyExistsException)
        {
            return Conflict("User already exists.");
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ex.Message);
        }
    }
}