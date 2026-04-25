using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StudentApp.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;
using StudentApp.Api.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace StudentApp.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SafetyController : ControllerBase
    {
        private readonly MongoService _mongoService;

        public SafetyController(MongoService mongoService)
        {
            _mongoService = mongoService;
        }

        [HttpPost("report")]
        public async Task<IActionResult> CreateReport([FromBody] SafetyReport report)
        {
            if (report == null) return BadRequest();

            // Extract user info from claims
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.Identity?.Name ?? User.FindFirst(ClaimTypes.Name)?.Value;

            if (userId == null) return Unauthorized(new { message = "User identity not found." });

            report.UserId = userId;
            report.ReportedBy = username ?? "Unknown Student";
            report.ReportedAt = DateTime.UtcNow;
            report.Status = "Pending";

            await _mongoService.SafetyReports.InsertOneAsync(report);
            return Ok(new { message = "Safety report submitted!" });
        }

        // 2. Get My Reports
        [HttpGet("my-reports")]
        public async Task<ActionResult<IEnumerable<SafetyReport>>> GetMyReports()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            // Match records owned by this user, OR legacy records that have no UserId set
            var filter = Builders<SafetyReport>.Filter.Or(
                Builders<SafetyReport>.Filter.Eq(r => r.UserId, userId),
                Builders<SafetyReport>.Filter.Eq(r => r.UserId, "")
            );

            var reports = await _mongoService.SafetyReports.Find(filter).ToListAsync();
            return Ok(reports);
        }

        [HttpPut("report/{id}")]
        public async Task<IActionResult> UpdateReport(string id, [FromBody] SafetyReport updatedReport)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var filter = Builders<SafetyReport>.Filter.And(
                Builders<SafetyReport>.Filter.Eq(r => r.Id, id),
                Builders<SafetyReport>.Filter.Eq(r => r.UserId, userId)
            );
            
            var existingReport = await _mongoService.SafetyReports.Find(filter).FirstOrDefaultAsync();
            if (existingReport == null) return NotFound(new { message = "Report not found or permission denied." });

            updatedReport.Id = id; 
            updatedReport.UserId = userId; // Ensure UserId is not changed
            updatedReport.ReportedBy = existingReport.ReportedBy; // Preserve name
            updatedReport.ReportedAt = existingReport.ReportedAt; // Preserve original time
            updatedReport.Status = existingReport.Status; // Preserve status

            await _mongoService.SafetyReports.ReplaceOneAsync(filter, updatedReport);
            return Ok(new { message = "Report updated successfully!" });
        }

        [HttpDelete("report/{id}")]
        public async Task<IActionResult> DeleteReport(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var filter = Builders<SafetyReport>.Filter.And(
                Builders<SafetyReport>.Filter.Eq(r => r.Id, id),
                Builders<SafetyReport>.Filter.Eq(r => r.UserId, userId)
            );

            var result = await _mongoService.SafetyReports.DeleteOneAsync(filter);
            if (result.DeletedCount == 0) return NotFound(new { message = "Report not found or permission denied." });
            return Ok(new { message = "Report deleted successfully!" });
        }

        // 5. Check URL - Chrome Extension uses this — no auth needed
        [AllowAnonymous]
        [HttpGet("check-url")]
        public async Task<IActionResult> CheckUrl([FromQuery] string url)
        {
            if (string.IsNullOrEmpty(url)) return BadRequest();
            
            try 
            {
                // සියලුම වාර්තා ලබාගනී
                var allReports = await _mongoService.SafetyReports.Find(_ => true).ToListAsync();
                
                // ඔබගේ DB එකේ URL එක "https://www.google.com" ලෙස තිබුණත්, browser එකේ යන එකත් සමඟ මෙය නිවැරදිව ගැළපේ
                // url.Contains(r.Url) මගින් DB එකේ ඇති link එකේ කොටසක් වත් අදාල URL එකේ ඇත්දැයි පරීක්ෂා කරයි
                bool isUnsafe = allReports.Any(r => !string.IsNullOrEmpty(r.Url) && url.Contains(r.Url));
                
                return Ok(new { unsafeSite = isUnsafe });
            }
            catch (Exception)
            {
                return Ok(new { unsafeSite = false });
            }
        }

        // 6. Music Recommendations
        [HttpGet("music-recommendations")]
        public IActionResult GetMusicRecommendations()
        {
            var musicList = new List<object>
            {
                new { id = 1, title = "Lofi Girl - Study Beats", url = "", genre = "Lo-fi", mood = "Focused" },
                new { id = 2, title = "Coffee Shop Lofi", url = "", genre = "Lo-fi", mood = "Calm" },
                new { id = 3, title = "Late Night Study", url = "", genre = "Lo-fi", mood = "Focused" },
                new { id = 4, title = "Rainy Night Lofi", url = "", genre = "Lo-fi", mood = "Relaxed" },
                new { id = 5, title = "Summer Lofi Mix", url = "", genre = "Lo-fi", mood = "Calm" },
                new { id = 6, title = "Cozy Bedroom Beats", url = "", genre = "Lo-fi", mood = "Relaxed" },
                new { id = 7, title = "Chill Lofi Hip Hop", url = "", genre = "Lo-fi", mood = "Calm" },
                new { id = 8, title = "Jazz Lofi Radio", url = "", genre = "Lo-fi", mood = "Relaxed" },
                new { id = 9, title = "Deep Focus Lofi", url = "", genre = "Lo-fi", mood = "Focused" },
                new { id = 10, title = "Morning Coffee Beats", url = "", genre = "Lo-fi", mood = "Energetic" },
                new { id = 11, title = "Beautiful Relaxing Piano", url = "", genre = "Piano", mood = "Calm" },
                new { id = 12, title = "Soft Piano for Study", url = "", genre = "Piano", mood = "Focused" },
                new { id = 13, title = "Classical Study Music", url = "", genre = "Piano", mood = "Focused" },
                new { id = 14, title = "Ghibli Piano Mix", url = "", genre = "Piano", mood = "Relaxed" },
                new { id = 15, title = "Mozart for Brain Power", url = "", genre = "Piano", mood = "Energetic" },
                new { id = 16, title = "Emotional Sad Piano", url = "", genre = "Piano", mood = "Calm" },
                new { id = 17, title = "Winter Piano Sounds", url = "", genre = "Piano", mood = "Relaxed" },
                new { id = 18, title = "Nocturnal Piano Mix", url = "", genre = "Piano", mood = "Calm" },
                new { id = 19, title = "Cinematic Study Piano", url = "", genre = "Piano", mood = "Focused" },
                new { id = 20, title = "Morning Light Piano", url = "", genre = "Piano", mood = "Energetic" },
                new { id = 21, title = "Heavy Thunderstorm", url = "", genre = "Nature", mood = "Relaxed" },
                new { id = 22, title = "Deep Forest Ambience", url = "", genre = "Nature", mood = "Calm" },
                new { id = 23, title = "Ocean Waves Crashing", url = "", genre = "Nature", mood = "Relaxed" },
                new { id = 24, title = "Campfire by the River", url = "", genre = "Nature", mood = "Calm" },
                new { id = 25, title = "Underwater Sounds", url = "", genre = "Nature", mood = "Relaxed" },
                new { id = 26, title = "White Noise for Focus", url = "", genre = "Nature", mood = "Focused" },
                new { id = 27, title = "Binaural Beats Focus", url = "", genre = "Nature", mood = "Focused" },
                new { id = 28, title = "Rain on Window", url = "", genre = "Nature", mood = "Calm" },
                new { id = 29, title = "Spring Forest Birds", url = "", genre = "Nature", mood = "Relaxed" },
                new { id = 30, title = "Cosmic Space Ambient", url = "", genre = "Nature", mood = "Relaxed" }
            };
            return Ok(musicList);
        }
    }
}