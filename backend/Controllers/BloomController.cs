using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Models;
using StudentApp.Api.Data;
using System.Security.Claims;

namespace StudentApp.Api.Controllers;

[ApiController]
[Route("api/bloom")]
[Authorize]
public class BloomController : ControllerBase
{
    private readonly MongoService _mongoService;

    public BloomController(MongoService mongoService)
    {
        _mongoService = mongoService;
    }

    private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? 
                                  User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name")?.Value ?? "";

    [HttpGet("data")]
    public async Task<IActionResult> GetBloomData()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var periods = await _mongoService.GetBloomPeriodsAsync(userId);
        var logs = await _mongoService.GetBloomDailyLogsAsync(userId);
        var settings = await _mongoService.GetBloomSettingsAsync(userId);

        return Ok(new {
            periods,
            dailyLogs = logs,
            settings = settings ?? new BloomSettings { UserId = userId, PeriodDuration = 5 }
        });
    }

    [HttpPost("period")]
    public async Task<IActionResult> SavePeriod([FromBody] BloomPeriod period)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        period.UserId = userId;
        if (string.IsNullOrEmpty(period.Id))
        {
            await _mongoService.CreateBloomPeriodAsync(period);
        }
        else
        {
            await _mongoService.UpdateBloomPeriodAsync(period.Id, period);
        }
        return Ok(period);
    }

    [HttpDelete("period/{id}")]
    public async Task<IActionResult> DeletePeriod(string id)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        // Note: For production, verify ownership before deleting
        await _mongoService.DeleteBloomPeriodAsync(id);
        return Ok();
    }

    [HttpPost("daily")]
    public async Task<IActionResult> SaveDailyLog([FromBody] BloomDailyLog log)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        log.UserId = userId;
        log.UpdatedAt = DateTime.UtcNow;
        await _mongoService.CreateOrUpdateBloomDailyLogAsync(userId, log.Date, log);
        return Ok(log);
    }

    [HttpDelete("daily/{date}")]
    public async Task<IActionResult> DeleteDailyLog(DateTime date)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        await _mongoService.DeleteBloomDailyLogAsync(userId, date);
        return Ok();
    }

    [HttpPost("settings")]
    public async Task<IActionResult> SaveSettings([FromBody] BloomSettings settings)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        settings.UserId = userId;
        await _mongoService.SaveBloomSettingsAsync(settings);
        return Ok(settings);
    }
}
