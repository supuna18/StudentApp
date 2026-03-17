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
            //Even when using Docker, the connection to MongoDB Atlas is done via MongoClient.
            var database = mongoClient.GetDatabase("EduSyncDB");
            _safetyCollection = database.GetCollection<SafetyReport>("SafetyReports");
        }

        // 1.inserting a report (CREATE)
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

        // 3. Checking whether the URL for the extension exists in the database.
        [HttpGet("check-url")]
        public async Task<IActionResult> CheckUrl([FromQuery] string url)
        {
            if (string.IsNullOrEmpty(url)) return BadRequest();

            // clear the URL (Case-insensitive matching සඳහා)
            string cleanUrl = url.ToLower()
                .Replace("https://", "").Replace("http://", "").Replace("www.", "");
            
            //Using regex to check whether the main part of the domain (e.g., ndtv.com) exists anywhere in the database.
            string domainOnly = cleanUrl.Split('/')[0];

            // Using a regex filter to find records that contain the word ‘ndtv.com
            var filter = Builders<SafetyReport>.Filter.Regex("Url", 
                new MongoDB.Bson.BsonRegularExpression(domainOnly, "i"));

            var reportExists = await _safetyCollection.Find(filter).AnyAsync();

            return Ok(new { unsafeSite = reportExists });
        }
    }
}