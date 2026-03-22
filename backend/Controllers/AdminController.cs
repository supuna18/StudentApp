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
}
