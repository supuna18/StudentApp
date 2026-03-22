using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Models;
using StudentApp.Api.Services;
using Microsoft.AspNetCore.Authorization;

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

    // 1. Register Endpoint
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            Role = string.IsNullOrEmpty(request.Role) ? "Student" : request.Role
        };

        var result = await _authService.RegisterAsync(user, request.Password);

        if (result == "Success") return Ok(new { message = "User registered successfully!" });
        return BadRequest(new { message = result });
    }

    // 2. Login Endpoint
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var token = await _authService.LoginAsync(request.Email, request.Password);

        if (token == null)
            return Unauthorized(new { message = "Invalid email or password" });

        return Ok(new { token });
    }

    // 3. User Management Endpoint (Requested as check-db)
    [Authorize(Roles = "Admin")]
    [HttpGet("check-db")]
    public async Task<IActionResult> CheckDb()
    {
        var users = await _authService.GetAllUsersForManagementAsync();
        return Ok(users);
    }
}

public class RegisterRequest
{
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string? Role { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}