using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StudentApp.Api.Data;
using StudentApp.Api.Models;

namespace StudentApp.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NotificationController : ControllerBase
{
    private readonly IMongoCollection<StudySession> _sessions;

    public NotificationController(MongoService mongoService)
    {
        // Scheduler sessions-ah indha controller access pannum
        _sessions = mongoService.StudySessions;
    }

    // Extension ketaal innaiku irukura study sessions-ah anuppum
    [HttpGet("upcoming/{email}")]
    public async Task<IActionResult> GetUpcoming(string email)
    {
        var today = DateTime.Now.ToString("yyyy-MM-dd");
        var session = await _sessions.Find(s => s.UserEmail == email && s.FromDate == today).FirstOrDefaultAsync();
        
        if (session == null) return Ok(new { message = "No sessions today" });

        return Ok(new { 
            title = session.Title, 
            subject = session.Subject, 
            time = session.StartTime 
        });
    }
}