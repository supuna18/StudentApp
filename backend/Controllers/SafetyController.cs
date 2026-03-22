using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StudentApp.Api.Models;
using StudentApp.Api.Data;

namespace StudentApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SafetyController : ControllerBase
    {
        private readonly MongoService _mongoService;

        public SafetyController(MongoService mongoService)
        {
            _mongoService = mongoService;
        }

        // 1. Report එකක් ඇතුළත් කිරීම (CREATE)
        [HttpPost("report")]
        public async Task<IActionResult> CreateReport([FromBody] SafetyReport report)
        {
            if (report == null) return BadRequest();
            report.ReportedAt = DateTime.UtcNow;
            report.Status = "Pending";
            await _mongoService.SafetyReports.InsertOneAsync(report);
            return Ok(new { message = "Safety report submitted!" });
        }

        // 2. සියලුම Reports ලබා ගැනීම (READ)
        [HttpGet("my-reports")]
        public async Task<ActionResult<IEnumerable<SafetyReport>>> GetMyReports()
        {
            var reports = await _mongoService.SafetyReports.Find(_ => true).ToListAsync();
            return Ok(reports);
        }

        // 3. Extension එක සඳහා URL එක Database එකේ තිබේදැයි පරීක්ෂා කිරීම (THE CHECK)
        [HttpGet("check-url")]
        public async Task<IActionResult> CheckUrl([FromQuery] string url)
        {
            if (string.IsNullOrEmpty(url)) return BadRequest();

            // URL එක පිරිසිදු කිරීම (Case-insensitive matching සඳහා)
            string cleanUrl = url.ToLower()
                .Replace("https://", "").Replace("http://", "").Replace("www.", "");
            
            // Domain එකේ මුල් කොටස (උදා: ndtv.com) Database එකේ ඕනෑම තැනක තිබේදැයි Regex මගින් පරීක්ෂා කරයි
            string domainOnly = cleanUrl.Split('/')[0];

            // Regex filter එකක් මගින් "ndtv.com" යන වචනය ඇති සියලුම records සොයයි
            var filter = Builders<SafetyReport>.Filter.Regex("Url", 
                new MongoDB.Bson.BsonRegularExpression(domainOnly, "i"));

            var reportExists = await _mongoService.SafetyReports.Find(filter).AnyAsync();

            return Ok(new { unsafeSite = reportExists });
        }
    }
}
