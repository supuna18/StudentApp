using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Data;
using StudentApp.Api.Models;

namespace StudentApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly MongoService _mongoService;

    public AdminController(MongoService mongoService)
    {
        _mongoService = mongoService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _mongoService.GetAdminStatsAsync();
        return Ok(stats);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _mongoService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("usage-trends")]
    public async Task<IActionResult> GetTrends()
    {
        var trends = await _mongoService.GetSystemUsageTrendsAsync();
        return Ok(trends);
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var result = await _mongoService.DeleteUserAsync(id);
        if (result) return Ok(new { message = "User deleted successfully" });
        return NotFound(new { message = "User not found" });
    }

    [HttpPatch("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateRoleRequest request)
    {
        var user = await _mongoService.GetUserByIdAsync(id);
        if (user == null) return NotFound(new { message = "User not found" });

        user.Role = request.Role;
        var result = await _mongoService.UpdateUserAsync(id, user);

        if (result) return Ok(new { message = "User role updated successfully", role = user.Role });
        return BadRequest(new { message = "Failed to update user role" });
    }
}

public class UpdateRoleRequest
{
    public string Role { get; set; } = "";
}
