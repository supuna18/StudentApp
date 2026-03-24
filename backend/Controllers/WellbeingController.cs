using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Models;
using StudentApp.Api.Services;

namespace StudentApp.Api.Controllers
{
    [ApiController]
[Route("api/[controller]")]
public class WellbeingController : ControllerBase
{
    private readonly WellbeingService _wellbeingService;

    public WellbeingController(WellbeingService wellbeingService)
    {
        _wellbeingService = wellbeingService;
    }

    [HttpPost("limits")]
    public async Task<IActionResult> SetTimeLimit([FromBody] UserLimit newLimit)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            Console.WriteLine($"[Wellbeing Validation Error] {errors}");
            return BadRequest(new { message = "Validation failed", errors });
        }

        try {
            Console.WriteLine($"[Wellbeing] Receiving limit for {newLimit.Domain} (User: {newLimit.UserId})");
            await _wellbeingService.UpsertLimitAsync(newLimit);
            return Ok(new { message = "Limit updated successfully! 🚀", data = newLimit });
        }
        catch (Exception ex) {
            Console.WriteLine($"[Wellbeing Error] {ex.Message}");
            return BadRequest(new { message = "Error saving to Database", error = ex.Message });
        }
    }

    // --- මෙන්න මේ GET කොටස අලුතින් එකතු කරන්න ---
    [HttpGet("limits/{userId}")]
    public async Task<IActionResult> GetUserLimits(string userId)
    {
        try {
            var limits = await _wellbeingService.GetLimitsByUserAsync(userId);
            return Ok(new { data = limits });
        }
        catch (Exception ex) {
            return BadRequest(new { message = "Error fetching limits", error = ex.Message });
        }
    }

    [HttpDelete("limits/{id}")]
    public async Task<IActionResult> DeleteLimit(string id)
    {
        try {
            await _wellbeingService.DeleteLimitAsync(id);
            return Ok(new { message = "Limit deleted! 🗑️" });
        }
        catch (Exception ex) {
            return BadRequest(new { message = "Error deleting limit", error = ex.Message });
        }
    }

    [HttpPost("usage")]
    public async Task<IActionResult> SaveUsage([FromBody] DailyUsage usage)
    {
        await _wellbeingService.UpdateUsageAsync(usage);
        return Ok(new { message = "Usage recorded! 📊" });
    }

    // --- මෙන්න මේ GET කොටස අලුතින් එකතු කරන්න ---
    [HttpGet("usage/{userId}")]
    public async Task<IActionResult> GetUserUsage(string userId)
    {
        try {
            var usage = await _wellbeingService.GetUsageByUserAsync(userId);
            return Ok(new { data = usage });
        }
        catch (Exception ex) {
            return BadRequest(new { message = "Error fetching usage", error = ex.Message });
        }
    }


}
}