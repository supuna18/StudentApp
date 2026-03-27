using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Services;
using StudentApp.Api.Models;
using System.Security.Claims;

namespace StudentApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;
    private readonly EmailService _emailService;

    public UsersController(UserService userService, EmailService emailService)
    {
        _userService = userService;
        _emailService = emailService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _userService.GetUserById(userId);
        if (user == null) return NotFound();

        return Ok(new 
        { 
            user.Username, 
            user.Email, 
            user.Role,
            user.CreatedAt 
        });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _userService.UpdateUserProfile(userId, request.Username, request.Email);
        if (result) return Ok(new { message = "Profile updated successfully" });

        return BadRequest(new { message = "Failed to update profile" });
    }

    [HttpDelete("profile")]
    public async Task<IActionResult> DeleteAccount()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _userService.DeleteUser(userId);
        if (result) return Ok(new { message = "Account deleted successfully" });

        return BadRequest(new { message = "Failed to delete account" });
    }

    [HttpPost("profile/request-password-otp")]
    public async Task<IActionResult> RequestPasswordOtp()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _userService.GetUserById(userId);
        if (user == null) return NotFound();

        var otp = new Random().Next(100000, 999999).ToString();
        var result = await _userService.SetPasswordResetOtp(userId, otp);

        if (result)
        {
            await _emailService.SendPasswordResetOtpEmailAsync(user.Email, otp);
            return Ok(new { message = "OTP sent to your registered email" });
        }

        return BadRequest(new { message = "Failed to send OTP" });
    }

    [HttpPost("profile/verify-password-otp")]
    public async Task<IActionResult> VerifyPasswordOtp([FromBody] VerifyOtpRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _userService.VerifyOtpAndChangePassword(userId, request.Otp, request.NewPassword);
        if (result) return Ok(new { message = "Password changed successfully" });

        return BadRequest(new { message = "Invalid OTP or OTP expired" });
    }
}

public class UpdateProfileRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class VerifyOtpRequest
{
    public string Otp { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}