using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Models;
using StudentApp.Api.Services;
using System;
using System.Threading.Tasks;

namespace StudentApp.Api.Controllers
{
    [ApiController]
    [Route("api/habit")]
    public class HabitController : ControllerBase
    {
        private readonly HabitService _habitService;

        public HabitController(HabitService habitService)
        {
            _habitService = habitService;
        }

        [HttpGet("ping")]
        public IActionResult Ping() => Ok("Habit Controller is ALIVE! 🚀");

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetStatus(string userId)
        {
            try {
                var status = await _habitService.GetStatusAsync(userId);
                // Return 200 OK even if null, so the UI doesn't throw console errors
                if (status == null) return Ok(new { message = "First_Time_User" });
                return Ok(status);
            }
            catch (Exception ex) {
                return BadRequest(new { message = "Error fetching habit data", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> UpsertStatus([FromBody] HabitStatus status)
        {
            try {
                if (status == null) return BadRequest("Data is null");
                await _habitService.UpsertStatusAsync(status);
                return Ok(new { message = "Status synchronized successfully! 🚀" });
            }
            catch (Exception ex) {
               Console.WriteLine($"🔥 BACKEND CRASH ERROR: {ex.Message}");
        if (ex.InnerException != null) Console.WriteLine($"🔗 INNER: {ex.InnerException.Message}");

                return BadRequest(new { message = "Error saving habit data", error = ex.Message });
            }
        }

        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteStatus(string userId)
        {
             try {
                await _habitService.DeleteStatusAsync(userId);
                return Ok(new { message = "Journey reset successfully! 🗑️" });
            }
            catch (Exception ex) {
                return BadRequest(new { message = "Error resetting journey", error = ex.Message });
            }
        }

        [HttpPost("log/{userId}")]
        public async Task<IActionResult> AddOrUpdateLog(string userId, [FromBody] DailyLog log)
        {
            try {
                if (log == null) return BadRequest("Log data is null");
                await _habitService.AddOrUpdateLogAsync(userId, log);
                return Ok(new { message = "Log entry saved successfully! 📝" });
            }
            catch (Exception ex) {
                return BadRequest(new { message = "Error saving log entry", error = ex.Message });
            }
        }

        [HttpDelete("log/{userId}/{logId}")]
        public async Task<IActionResult> DeleteLog(string userId, string logId)
        {
            try {
                await _habitService.DeleteLogAsync(userId, logId);
                return Ok(new { message = "Log entry deleted successfully! 🗑️" });
            }
            catch (Exception ex) {
                return BadRequest(new { message = "Error deleting log entry", error = ex.Message });
            }
        }
    }
}
