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
    private readonly IMongoCollection<StudyEvent> _events;

    public SchedulerController(MongoService mongoService)
    {
        _sessions = mongoService.StudySessions;
        _events = mongoService.StudyEvents;
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

    // ════════════ NEW: GROUP CALENDAR EVENTS (Member 2) ════════════
    
    // GET: api/scheduler/group/{groupId}
    [HttpGet("group/{groupId}")]
    public async Task<ActionResult<List<StudyEvent>>> GetByGroup(string groupId) =>
        await _events.Find(e => e.GroupId == groupId).ToListAsync();

    // POST: api/scheduler
    [HttpPost]
    public async Task<IActionResult> CreateEvent(StudyEvent studyEvent)
    {
        if (string.IsNullOrEmpty(studyEvent.Description)) studyEvent.Description = "Group Study Session";
        if (studyEvent.EndTime == default) studyEvent.EndTime = studyEvent.StartTime.AddHours(1);
        
        await _events.InsertOneAsync(studyEvent);
        return Ok(new { message = "Group Event Scheduled Successfully" });
    }

    // ════════════ Existing Updates ════════════

    // 3. UPDATE SESSION (EDIT): api/scheduler/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, StudySession updatedSession)
    {
        var filter = Builders<StudySession>.Filter.Eq(s => s.Id, id);
        var result = await _sessions.ReplaceOneAsync(filter, updatedSession);
        if (result.MatchedCount == 0) return NotFound(new { message = "Session not found" });
        return Ok(new { message = "Session Updated Successfully" });
    }

    // 4. DELETE SESSION: api/scheduler/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await _sessions.DeleteOneAsync(s => s.Id == id);
        if (result.DeletedCount == 0) return NotFound(new { message = "Session not found" });
        return Ok(new { message = "Session Deleted Successfully" });
    }

    // 5. MARK SESSION AS STARTED/COMPLETE
    [HttpPut("complete/{id}")]
    public async Task<IActionResult> MarkComplete(string id)
    {
        var filter = Builders<StudySession>.Filter.Eq(s => s.Id, id);
        var update = Builders<StudySession>.Update.Set(s => s.IsCompleted, true);
        var result = await _sessions.UpdateOneAsync(filter, update);
        if (result.MatchedCount == 0) return NotFound(new { message = "Session not found" });
        return Ok(new { message = "Focus Session Started!" });
    }
}