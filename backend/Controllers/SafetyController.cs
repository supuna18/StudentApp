using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StudentApp.Api.Models;

namespace StudentApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SafetyController : ControllerBase
    {
        private readonly IMongoCollection<SafetyReport> _safetyCollection;

        public SafetyController(IMongoClient mongoClient)
        {
            // docker-compose එකේ තියෙන "StudentDB" නම පාවිච්චි කරන්න
            var database = mongoClient.GetDatabase("StudentDB");
            _safetyCollection = database.GetCollection<SafetyReport>("SafetyReports");
        }

        [HttpPost("report")]
        public async Task<IActionResult> CreateReport([FromBody] SafetyReport report)
        {
            if (report == null) return BadRequest();
            report.ReportedAt = DateTime.UtcNow;
            await _safetyCollection.InsertOneAsync(report);
            return Ok(new { message = "Safety report submitted!" });
        }

        [HttpGet("check-url")]
        public async Task<IActionResult> CheckUrl([FromQuery] string url)
        {
            // සරල logic එකක් extension එක සඳහා
            bool isBlacklisted = url.Contains("scam") || url.Contains("fake");
            return Ok(new { unsafeSite = isBlacklisted });
        }
    }
}