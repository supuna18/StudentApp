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
        try {
            await _wellbeingService.CreateLimitAsync(newLimit);
            return Ok(new { message = "Saved to MongoDB Compass! 🚀", data = newLimit });
        }
        catch (Exception ex) {
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

    [HttpPost("usage")]
public async Task<IActionResult> SaveUsage([FromBody] DailyUsage usage)
{
    await _wellbeingService.UpdateUsageAsync(usage);
    return Ok(new { message = "Usage recorded! 📊" });
}


}
}