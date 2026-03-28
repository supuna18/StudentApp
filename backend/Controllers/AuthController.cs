using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Models;
using StudentApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims; // IMPORTANT for ClaimTypes

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
        if (string.IsNullOrWhiteSpace(request.Username))
            return BadRequest(new { message = "Username is required." });

        // Regex: Only letters and spaces
        if (!System.Text.RegularExpressions.Regex.IsMatch(request.Username, @"^[a-zA-Z\s]+$"))
            return BadRequest(new { message = "Full name can only contain alphabetic characters." });

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            Role = string.IsNullOrEmpty(request.Role) ? "Student" : request.Role
        };

        var result = await _authService.RegisterAsync(user, request.Password);

        if (result == "Success")
            return Ok(new { message = "User registered successfully!" });

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

    // 3. Admin - Get All Users
    [Authorize(Roles = "Admin")]
    [HttpGet("check-db")]
    public async Task<IActionResult> CheckDb()
    {
        var users = await _authService.GetAllUsersForManagementAsync();
        return Ok(users);
    }

    // 4. 🔥 Get Logged-in User Details (/me)
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        // Get User ID from token
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
            return BadRequest("User ID not found in token.");

        // Get user from database
        var user = await _authService.GetUserByIdAsync(userId);

        if (user == null)
            return NotFound();

        // Return safe user data (without password)
        return Ok(new
        {
            user.Id,
            user.Username,
            user.Email,
            user.Role,
            user.CreatedAt
        });
    }
}

// Request Models
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