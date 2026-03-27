using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Models;
using StudentApp.Api.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StudentApp.Api.Controllers
{
    [ApiController]
    [Route("api/wellbeing")]
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
                await _wellbeingService.UpsertLimitAsync(newLimit);
                return Ok(new { message = "Limit updated successfully! 🚀", data = newLimit });
            }
            catch (Exception ex) {
                return BadRequest(new { message = "Error saving limit", error = ex.Message });
            }
        }

        [HttpGet("limits/{userId}")]
        public async Task<IActionResult> GetUserLimits([FromRoute] string userId)
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
        public async Task<IActionResult> DeleteLimit([FromRoute] string id)
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

        [HttpGet("usage/{userId}")]
        public async Task<IActionResult> GetUserUsage([FromRoute] string userId)
        {
            try {
                var usage = await _wellbeingService.GetUsageByUserAsync(userId);
                return Ok(new { data = usage });
            }
            catch (Exception ex) {
                return BadRequest(new { message = "Error fetching usage", error = ex.Message });
            }
        }

        [HttpGet("profile/{userId}")]
        public async Task<IActionResult> GetProfile([FromRoute] string userId)
        {
            try {
                var profile = await _wellbeingService.GetProfileAsync(userId);
                if (profile == null) {
                    return Ok(new { 
                        streak = 0, 
                        badges = new List<string>(),
                        lastFocusDate = (DateTime?)null
                    });
                }
                
                return Ok(new { 
                    streak = profile.FocusStreak, 
                    badges = profile.UnlockedBadges ?? new List<string>(),
                    lastFocusDate = profile.LastFocusDate
                });
            }
            catch (Exception ex) {
                // Return a default profile on error instead of 400/500 to keep UI alive
                return Ok(new { streak = 1, badges = new List<string> { "🌱" }, error = ex.Message });
            }
        }

        [HttpPost("profile/{userId}/sync")]
        public async Task<IActionResult> SyncProfile([FromRoute] string userId, [FromBody] ProfileSyncDto dto)
        {
            try {
                await _wellbeingService.SyncProfileAsync(userId, dto.Streak, dto.Badges);
                return Ok(new { message = "Profile synced! ☁️" });
            }
            catch (Exception ex) {
                return BadRequest(new { message = "Error syncing profile", error = ex.Message });
            }
        }

        // ── Admin endpoints ─────────────────────────────────────────

        [HttpGet("admin/overview")]
        public async Task<IActionResult> GetAdminOverview()
        {
            try {
                var overview = await _wellbeingService.GetAdminOverviewAsync();
                return Ok(overview);
            }
            catch (Exception ex) {
                return BadRequest(new { message = "Error fetching admin overview", error = ex.Message, stack = ex.StackTrace });
            }
        }

        [HttpGet("admin/users")]
        public async Task<IActionResult> GetAdminUserSummaries()
        {
            try {
                var summaries = await _wellbeingService.GetAdminUserSummariesAsync();
                return Ok(summaries);
            }
            catch (Exception ex) {
                return BadRequest(new { message = "Error fetching user summaries", error = ex.Message, stack = ex.StackTrace });
            }
        }
    }

    public class ProfileSyncDto {
        public int Streak { get; set; }
        public List<string> Badges { get; set; } = new List<string>();
    }
}