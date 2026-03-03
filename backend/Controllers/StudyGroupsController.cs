using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StudentApp.Api.Data;
using StudentApp.Api.Models;

namespace StudentApp.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StudyGroupsController : ControllerBase
{
    private readonly IMongoCollection<StudyGroup> _groups;

    public StudyGroupsController(MongoService mongoService)
    {
        // This connects to the public property we just added in MongoService
        _groups = mongoService.StudyGroups;
    }

    // 1. GET ALL: fetch("http://localhost:5000/api/studygroups")
    [HttpGet]
    public async Task<ActionResult<List<StudyGroup>>> Get() =>
        await _groups.Find(_ => true).ToListAsync();

    // 2. CREATE: Handles the onCreate function in your React code
    [HttpPost]
    public async Task<IActionResult> Create(StudyGroup newGroup)
    {
        await _groups.InsertOneAsync(newGroup);
        return Ok(newGroup);
    }

    // 3. JOIN: Handles the onJoin function in your React code
    [HttpPost("join/{code}")]
    public async Task<IActionResult> Join(string code, [FromBody] JoinRequest request)
    {
        var filter = Builders<StudyGroup>.Filter.Eq(g => g.JoinCode, code);
        var group = await _groups.Find(filter).FirstOrDefaultAsync();

        if (group == null) return NotFound(new { message = "Invalid Join Code" });

        var newMember = new Member { Username = request.Username, Phone = request.Phone };
        var update = Builders<StudyGroup>.Update.Push(g => g.Members, newMember);
        
        await _groups.UpdateOneAsync(filter, update);
        return Ok(new { message = "Joined Successfully" });
    }
}