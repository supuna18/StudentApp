using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StudentApp.Api.Data;
using StudentApp.Api.Models;

namespace StudentApp.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SchedulerController : ControllerBase
{
    private readonly IMongoCollection<StudyEvent> _events;

    public SchedulerController(MongoService mongoService)
    {
        // [EDIT] Use the Database property attached to the existing StudyGroups collection
        // This avoids needing a separate .Database property in MongoService.cs
        _events = mongoService.StudyGroups.Database.GetCollection<StudyEvent>("StudyEvents");
    }

    // [GET] Get all events for a specific group
    [HttpGet("group/{groupId}")]
    public async Task<ActionResult<List<StudyEvent>>> GetByGroup(string groupId) =>
        await _events.Find(e => e.GroupId == groupId).ToListAsync();

    // [POST] Create a new study session
    [HttpPost]
    public async Task<IActionResult> Create(StudyEvent newEvent)
    {
        await _events.InsertOneAsync(newEvent);
        return Ok(newEvent);
    }
}