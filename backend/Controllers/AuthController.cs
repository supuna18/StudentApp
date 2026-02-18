using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Models;
using StudentApp.Api.Services;

namespace StudentApp.Api.Controllers;

[ApiController]
[Route("api/auth")] // URL එක ලේසි කරා: /api/auth/register
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var user = new User
        {
            Username = request.Username,
            Email = request.Email
        };

        var result = await _authService.RegisterAsync(user, request.Password);

        if (result == "Success") return Ok(new { message = "User registered successfully!" });
        return BadRequest(new { message = result });
    }
}

// මේක ලේසි වෙන්න මෙතනම තියන්න
public class RegisterRequest
{
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}