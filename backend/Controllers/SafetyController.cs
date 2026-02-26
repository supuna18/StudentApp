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
            //  appsettings - EduSyncDB 
            var database = mongoClient.GetDatabase("EduSyncDB");
            _safetyCollection = database.GetCollection<SafetyReport>("SafetyReports");
        }

        // 1. Save Report 
        [HttpPost("report")]
        public async Task<IActionResult> CreateReport([FromBody] SafetyReport report)
        {
            if (report == null) return BadRequest();
            
            report.ReportedAt = DateTime.UtcNow;
            await _safetyCollection.InsertOneAsync(report);
            return Ok(new { message = "Safety report submitted to EduSyncDB!" });
        }

        // 2. Check URL  (for an Extension)
        [HttpGet("check-url")]
        public async Task<IActionResult> CheckUrl([FromQuery] string url)
        {
            // simple logic :  database eke thiyenwd kyl psse blnn plwn
            bool isBlacklisted = url.Contains("scam") || url.Contains("fake");
            return Ok(new { unsafeSite = isBlacklisted });
        }

        // 3. all Reports blnw (see Admin)
        [HttpGet("all-reports")]
        public async Task<ActionResult<IEnumerable<SafetyReport>>> GetReports()
        {
            var reports = await _safetyCollection.Find(_ => true).ToListAsync();
            return Ok(reports);
        }
    }
}