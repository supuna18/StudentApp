using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StudentApp.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudentApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SafetyController : ControllerBase
    {
        private readonly IMongoCollection<SafetyReport> _safetyCollection;

        public SafetyController(IMongoClient mongoClient)
        {
            // Docker use kalath MongoClient magin Atlas connect wei
            var database = mongoClient.GetDatabase("EduSyncDB");
            _safetyCollection = database.GetCollection<SafetyReport>("SafetyReports");
        }

        // 1. Report ekak insert kirma (CREATE)
        [HttpPost("report")]
        public async Task<IActionResult> CreateReport([FromBody] SafetyReport report)
        {
            if (report == null) return BadRequest();
            report.ReportedAt = DateTime.UtcNow;
            report.Status = "Pending";
            await _safetyCollection.InsertOneAsync(report);
            return Ok(new { message = "Safety report submitted!" });
        }

        // 2. get all Reports (READ)
        [HttpGet("my-reports")]
        public async Task<ActionResult<IEnumerable<SafetyReport>>> GetMyReports()
        {
            var reports = await _safetyCollection.Find(_ => true).ToListAsync();
            return Ok(reports);
        }

        // 3. Extension eka sadaha URL ek Database eke thibedai check kirma (THE CHECK)
        [HttpGet("check-url")]
        public async Task<IActionResult> CheckUrl([FromQuery] string url)
        {
            if (string.IsNullOrEmpty(url)) return BadRequest();

            // URL eka clear kirima (Case-insensitive matching සඳහා)
            string cleanUrl = url.ToLower()
                .Replace("https://", "").Replace("http://", "").Replace("www.", "");
            
            // Domain eke mul kotasa (ex: ndtv.com) Database eke onema thanka thibedai Regex magin check karai
            string domainOnly = cleanUrl.Split('/')[0];

            // Regex filter ekk magin "ndtv.com" yana word eka ati records soyai
            var filter = Builders<SafetyReport>.Filter.Regex("Url", 
                new MongoDB.Bson.BsonRegularExpression(domainOnly, "i"));

            var reportExists = await _safetyCollection.Find(filter).AnyAsync();

            return Ok(new { unsafeSite = reportExists });
        }
    }
}