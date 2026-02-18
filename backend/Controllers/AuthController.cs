using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Models;
using StudentApp.Api.Services;

namespace StudentApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        var user = new User
        {
            Username = model.Username,
            Email = model.Email,
            Role = "Student" // Default රෝල් එක
        };

        var result = await _authService.RegisterAsync(user, model.Password);

        if (result == "Success") return Ok(new { message = "User registered successfully!" });
        return BadRequest(new { message = result });
    }
}

// දත්ත ගේන්න පාවිච්චි කරන පොඩි Model එකක්
public record RegisterDto(string Username, string Email, string Password);