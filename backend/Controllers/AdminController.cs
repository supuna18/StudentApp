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
        if (result) 
        {
            await _mongoService.LogActivityAsync("Admin Operation", $"User deleted (ID: {id})", "Warning");
            return Ok(new { message = "User deleted successfully" });
        }
        return NotFound(new { message = "User not found" });
    }

    [HttpPatch("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateRoleRequest request)
    {
        var user = await _mongoService.GetUserByIdAsync(id);
        if (user == null) return NotFound(new { message = "User not found" });

        user.Role = request.Role;
        var result = await _mongoService.UpdateUserAsync(id, user);

        if (result) 
        {
            await _mongoService.LogActivityAsync("Admin Operation", $"User role updated to {request.Role} (User: {user.Email})");
            return Ok(new { message = "User role updated successfully", role = user.Role });
        }
        return BadRequest(new { message = "Failed to update user role" });
    }

    // --- Safety Report Management ---
    [HttpGet("safety-reports")]
    public async Task<IActionResult> GetAllSafetyReports()
    {
        var reports = await _mongoService.GetAllSafetyReportsAsync();
        return Ok(reports);
    }

    [HttpPatch("safety-reports/{id}/approve")]
    public async Task<IActionResult> ApproveSafetyReport(string id)
    {
        var result = await _mongoService.UpdateSafetyReportStatusAsync(id, "Approved");
        if (result) return Ok(new { message = "Safety report approved!" });
        return NotFound(new { message = "Report not found" });
    }

    [HttpDelete("safety-reports/{id}")]
    public async Task<IActionResult> DeleteSafetyReport(string id)
    {
        var result = await _mongoService.DeleteSafetyReportAsync(id);
        if (result) return Ok(new { message = "Safety report deleted!" });
        return NotFound(new { message = "Report not found" });
    }

    [HttpGet("system-health")]
    public async Task<IActionResult> GetSystemHealth()
    {
        var health = await _mongoService.GetSystemHealthAsync();
        return Ok(health);
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var distribution = await _mongoService.GetResourceDistributionAsync();
        var trends = await _mongoService.GetMonthlyActivityTrendsAsync();
        return Ok(new { distribution, trends });
    }

    [HttpGet("resources")]
    public async Task<IActionResult> GetResources()
    {
        var resources = await _mongoService.GetAllResourcesAsync();
        return Ok(resources);
    }
}

public class UpdateRoleRequest
{
    public string Role { get; set; } = "";
}
