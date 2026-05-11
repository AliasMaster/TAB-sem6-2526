using Auth.Application.Common.Interfaces;
using Auth.Application.DTO;
using Auth.Domain.Exceptions;

using Microsoft.AspNetCore.Mvc;

namespace Auth.API.Controllers;

[ApiController]
[Route("[controller]")]
public class LoginController : ControllerBase
{
    private readonly IAuthService _authService;

    public LoginController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        try
        {
            var response = await _authService.LoginAsync(request.Username, request.Password, ct);
            return Ok(response);
        }
        catch (InvalidCredentialsException)
        {
            return Unauthorized("Invalid credentials.");
        }
    }
}