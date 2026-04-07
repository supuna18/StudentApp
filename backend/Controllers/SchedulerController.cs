using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StudentApp.Api.Data;
using StudentApp.Api.Models;

namespace StudentApp.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SchedulerController : ControllerBase
{
    private readonly IMongoCollection<StudySession> _sessions;

    public SchedulerController(MongoService mongoService)
    {
        _sessions = mongoService.StudySessions;
    }

    // 1. GET ALL SESSIONS FOR A USER: api/scheduler/{email}
    [HttpGet("{email}")]
    public async Task<ActionResult<List<StudySession>>> Get(string email) =>
        await _sessions.Find(s => s.UserEmail == email).ToListAsync();

    // 2. CREATE NEW SESSION: api/scheduler/create
    [HttpPost("create")]
    public async Task<IActionResult> Create(StudySession session)
    {
        await _sessions.InsertOneAsync(session);
        return Ok(new { message = "Session Scheduled Successfully" });
    }

    // 3. UPDATE SESSION (EDIT): api/scheduler/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, StudySession updatedSession)
    {
        var filter = Builders<StudySession>.Filter.Eq(s => s.Id, id);
        
        // Database-la irukura pazhaya session-ah pudhu details vachi replace pannuvom
        var result = await _sessions.ReplaceOneAsync(filter, updatedSession);

        if (result.MatchedCount == 0)
        {
            return NotFound(new { message = "Session not found" });
        }

        return Ok(new { message = "Session Updated Successfully" });
    }

    // 4. DELETE SESSION: api/scheduler/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await _sessions.DeleteOneAsync(s => s.Id == id);

        if (result.DeletedCount == 0)
        {
            return NotFound(new { message = "Session not found" });
        }

        return Ok(new { message = "Session Deleted Successfully" });
    }

    // ════════════ 5. NEW: MARK SESSION AS STARTED/COMPLETE ════════════
    // Frontend-la "Start Focus Session" click pannunaal indha API call aagum.
    // Idhu database-la IsCompleted = true nu maathum, appo thaan reminder mail anuppadhu.
    [HttpPut("complete/{id}")]
    public async Task<IActionResult> MarkComplete(string id)
    {
        var filter = Builders<StudySession>.Filter.Eq(s => s.Id, id);
        var update = Builders<StudySession>.Update.Set(s => s.IsCompleted, true);
        
        var result = await _sessions.UpdateOneAsync(filter, update);

        if (result.MatchedCount == 0)
        {
            return NotFound(new { message = "Session not found" });
        }

        return Ok(new { message = "Focus Session Started!" });
    }
}