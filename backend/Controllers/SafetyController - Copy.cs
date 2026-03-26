using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StudentApp.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System; // DateTime සඳහා අනිවාර්යයි
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

        [HttpPost("report")]
        public async Task<IActionResult> CreateReport([FromBody] SafetyReport report)
        {
            if (report == null) return BadRequest();
            report.ReportedAt = DateTime.UtcNow;
            report.Status = "Pending";
            await _mongoService.SafetyReports.InsertOneAsync(report);
            return Ok(new { message = "Safety report submitted!" });
        }

        [HttpGet("my-reports")]
        public async Task<ActionResult<IEnumerable<SafetyReport>>> GetMyReports()
        {
            var reports = await _mongoService.SafetyReports.Find(_ => true).ToListAsync();
            return Ok(reports);
        }

        [HttpGet("check-url")]
        public async Task<IActionResult> CheckUrl([FromQuery] string url)
        {
            if (string.IsNullOrEmpty(url)) return BadRequest();
            string cleanUrl = url.ToLower().Replace("https://", "").Replace("http://", "").Replace("www.", "");
            string domainOnly = cleanUrl.Split('/')[0];

            var filter = Builders<SafetyReport>.Filter.Regex("Url", new MongoDB.Bson.BsonRegularExpression(domainOnly, "i"));
            var reportExists = await _mongoService.SafetyReports.Find(filter).AnyAsync();
            return Ok(new { unsafeSite = reportExists });
        }

        // --- UPDATED MUSIC RECOMMENDATIONS (30 TRACKS) ---
        [HttpGet("music-recommendations")]
        public IActionResult GetMusicRecommendations()
        {
            var musicList = new List<object>
            {
                new { id = 1, title = "Lofi Girl - Study Beats", url = "https://www.youtube.com/embed/jfKfPfyJRdk", genre = "Lo-fi", mood = "Focused" },
                new { id = 2, title = "Coffee Shop Lofi", url = "https://www.youtube.com/embed/hHW1oY26kxQ", genre = "Lo-fi", mood = "Calm" },
                new { id = 3, title = "Late Night Study", url = "https://www.youtube.com/embed/lTRiuFIWV5M", genre = "Lo-fi", mood = "Focused" },
                new { id = 4, title = "Rainy Night Lofi", url = "https://www.youtube.com/embed/5wRWniH7rt8", genre = "Lo-fi", mood = "Relaxed" },
                new { id = 5, title = "Summer Lofi Mix", url = "https://www.youtube.com/embed/6m6YlXoXvXw", genre = "Lo-fi", mood = "Calm" },
                new { id = 6, title = "Cozy Bedroom Beats", url = "https://www.youtube.com/embed/1W5BA0cy_O4", genre = "Lo-fi", mood = "Relaxed" },
                new { id = 7, title = "Chill Lofi Hip Hop", url = "https://www.youtube.com/embed/8Xp_R7N0x_A", genre = "Lo-fi", mood = "Calm" },
                new { id = 8, title = "Jazz Lofi Radio", url = "https://www.youtube.com/embed/neV3EPgvZ3g", genre = "Lo-fi", mood = "Relaxed" },
                new { id = 9, title = "Deep Focus Lofi", url = "https://www.youtube.com/embed/36S8vA6M7zI", genre = "Lo-fi", mood = "Focused" },
                new { id = 10, title = "Morning Coffee Beats", url = "https://www.youtube.com/embed/m06Lp6YxPks", genre = "Lo-fi", mood = "Energetic" },
                new { id = 11, title = "Beautiful Relaxing Piano", url = "https://www.youtube.com/embed/5qyHEn_S36E", genre = "Piano", mood = "Calm" },
                new { id = 12, title = "Soft Piano for Study", url = "https://www.youtube.com/embed/HGV6zWvT80A", genre = "Piano", mood = "Focused" },
                new { id = 13, title = "Classical Study Music", url = "https://www.youtube.com/embed/mIYzp5rcTvU", genre = "Piano", mood = "Focused" },
                new { id = 14, title = "Ghibli Piano Mix", url = "https://www.youtube.com/embed/V66p_M6u67I", genre = "Piano", mood = "Relaxed" },
                new { id = 15, title = "Mozart for Brain Power", url = "https://www.youtube.com/embed/j_NTo6I7D38", genre = "Piano", mood = "Energetic" },
                new { id = 16, title = "Emotional Sad Piano", url = "https://www.youtube.com/embed/r9KxTst0fO0", genre = "Piano", mood = "Calm" },
                new { id = 17, title = "Winter Piano Sounds", url = "https://www.youtube.com/embed/VfM6uG9fN8k", genre = "Piano", mood = "Relaxed" },
                new { id = 18, title = "Nocturnal Piano Mix", url = "https://www.youtube.com/embed/5uS5P7P9sA8", genre = "Piano", mood = "Calm" },
                new { id = 19, title = "Cinematic Study Piano", url = "https://www.youtube.com/embed/pLp1oY26kxQ", genre = "Piano", mood = "Focused" },
                new { id = 20, title = "Morning Light Piano", url = "https://www.youtube.com/embed/H0W6M0xXvXw", genre = "Piano", mood = "Energetic" },
                new { id = 21, title = "Heavy Thunderstorm", url = "https://www.youtube.com/embed/mPZkdNFqePs", genre = "Nature", mood = "Relaxed" },
                new { id = 22, title = "Deep Forest Ambience", url = "https://www.youtube.com/embed/xP5-iIeK8VY", genre = "Nature", mood = "Calm" },
                new { id = 23, title = "Ocean Waves Crashing", url = "https://www.youtube.com/embed/W_Uf1Vj8W0A", genre = "Nature", mood = "Relaxed" },
                new { id = 24, title = "Campfire by the River", url = "https://www.youtube.com/embed/L1v3EPgvZ3g", genre = "Nature", mood = "Calm" },
                new { id = 25, title = "Underwater Sounds", url = "https://www.youtube.com/embed/r46S8vA6M7zI", genre = "Nature", mood = "Relaxed" },
                new { id = 26, title = "White Noise for Focus", url = "https://www.youtube.com/embed/nMfPqeZjc2c", genre = "Nature", mood = "Focused" },
                new { id = 27, title = "Binaural Beats Focus", url = "https://www.youtube.com/embed/sjkrrmBnpGE", genre = "Nature", mood = "Focused" },
                new { id = 28, title = "Rain on Window", url = "https://www.youtube.com/embed/m_6m6YlXoXvX", genre = "Nature", mood = "Calm" },
                new { id = 29, title = "Spring Forest Birds", url = "https://www.youtube.com/embed/VfM6uLp6YxP", genre = "Nature", mood = "Relaxed" },
                new { id = 30, title = "Cosmic Space Ambient", url = "https://www.youtube.com/embed/jfK7N0xXvXw", genre = "Nature", mood = "Relaxed" }
            };
            return Ok(musicList);
        }
    }
}
