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
            // Database නම EduSyncDB ලෙස ස්ථිරවම සකස් කළා
            var database = mongoClient.GetDatabase("EduSyncDB");
            _safetyCollection = database.GetCollection<SafetyReport>("SafetyReports");
        }

        // 1. අලුත් Report එකක් ඇතුළත් කිරීම (CREATE)
        [HttpPost("report")]
        public async Task<IActionResult> CreateReport([FromBody] SafetyReport report)
        {
            if (report == null) return BadRequest();
            report.ReportedAt = DateTime.UtcNow;
            report.Status = "Pending";
            await _safetyCollection.InsertOneAsync(report);
            return Ok(new { message = "Successfully reported to EduSyncDB!" });
        }

        // 2. සියලුම Reports ලබා ගැනීම (READ - History එක පෙන්වීමට මෙය අත්‍යවශ්‍යයි)
        [HttpGet("my-reports")]
        public async Task<ActionResult<IEnumerable<SafetyReport>>> GetMyReports()
        {
            var reports = await _safetyCollection.Find(_ => true).ToListAsync();
            return Ok(reports);
        }

        // 3. පවතින Report එකක් වෙනස් කිරීම (UPDATE)
        [HttpPut("report/{id}")]
        public async Task<IActionResult> UpdateReport(string id, [FromBody] SafetyReport updatedReport)
        {
            var result = await _safetyCollection.ReplaceOneAsync(r => r.Id == id, updatedReport);
            if (result.ModifiedCount == 0) return NotFound();
            return Ok(new { message = "Report updated successfully!" });
        }

        // 4. Report එකක් මකා දැමීම (DELETE)
        [HttpDelete("report/{id}")]
        public async Task<IActionResult> DeleteReport(string id)
        {
            var result = await _safetyCollection.DeleteOneAsync(r => r.Id == id);
            if (result.DeletedCount == 0) return NotFound();
            return Ok(new { message = "Report deleted successfully!" });
        }

        [HttpGet("check-url")]
        public async Task<IActionResult> CheckUrl([FromQuery] string url)
        {
            bool isBlacklisted = url.Contains("scam") || url.Contains("fake");
            return Ok(new { unsafeSite = isBlacklisted });
        }
    }
}