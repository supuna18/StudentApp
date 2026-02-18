using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Models;
using StudentApp.Api.Services;

namespace StudentApp.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    // Register Endpoint
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            Role = "Student" // මුලින්ම හැමෝම Student විදිහට සේව් වෙන්නේ
        };

        var result = await _authService.RegisterAsync(user, request.Password);

        if (result == "Success") return Ok(new { message = "User registered successfully!" });
        return BadRequest(new { message = result });
    }

    // Login Endpoint
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var token = await _authService.LoginAsync(request.Email, request.Password);

        if (token == null)
            return Unauthorized(new { message = "Invalid email or password" });

        return Ok(new { token });
    }
}

// දත්ත බාරගන්නා පන්ති (Request Classes)
public class RegisterRequest
{
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public class LoginRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}