using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StudentApp.Api.Data;
using StudentApp.Api.Models;
using StudentApp.Api.Services;

namespace StudentApp.Api.Controllers;

[Route("api/studygroups")] 
[ApiController]
public class StudyGroupsController : ControllerBase
{
    private readonly IMongoCollection<StudyGroup> _groups;
    private readonly IMongoCollection<ChatMessage> _chats;
    private readonly EmailService _emailService;

    public StudyGroupsController(MongoService mongoService, EmailService emailService)
    {
        _groups = mongoService.StudyGroups;
        _chats = mongoService.ChatHistory;
        _emailService = emailService;
    }

    [HttpGet("user/{email}")]
    public async Task<ActionResult<List<StudyGroup>>> GetUserGroups(string email)
    {
        var filter = Builders<StudyGroup>.Filter.Or(
            Builders<StudyGroup>.Filter.Eq(g => g.CreatedByEmail, email),
            Builders<StudyGroup>.Filter.ElemMatch(g => g.Members, m => m.Email == email)
        );
        return await _groups.Find(filter).ToListAsync();
    }

    // --- JOIN METHOD (FIXED) ---
    [HttpPost("join")]
    public async Task<IActionResult> Join([FromBody] JoinRequest request)
    {
        // JoinCode MATRUM GroupName (Subject) renduமே match aaganum
        var group = await _groups.Find(g => g.JoinCode == request.JoinCode && g.GroupName == request.Subject).FirstOrDefaultAsync();
        
        if (group == null) 
            return BadRequest(new { message = "Invalid Code or Subject Mismatch!" });

        if (group.Members.Any(m => m.Email == request.Email))
            return Ok(new { message = "Already a member", groupId = group.Id });

        var update = Builders<StudyGroup>.Update.Push(g => g.Members, new MemberDetail { 
            Email = request.Email, 
            Phone = request.PhoneNumber 
        });

        await _groups.UpdateOneAsync(g => g.Id == group.Id, update);
        return Ok(new { message = "Joined Successfully!", groupId = group.Id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateRequest updateData)
    {
        var filter = Builders<StudyGroup>.Filter.Eq(g => g.Id, id);
        var update = Builders<StudyGroup>.Update
            .Set(g => g.GroupName, updateData.GroupName)
            .Set(g => g.Description, updateData.Description)
            .Set(g => g.PhoneNumber, updateData.PhoneNumber);
        await _groups.UpdateOneAsync(filter, update);
        return Ok(new { message = "Updated!" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _groups.DeleteOneAsync(g => g.Id == id);
        return Ok(new { message = "Deleted!" });
    }

    [HttpPost("leave")]
    public async Task<IActionResult> Leave([FromBody] LeaveRequest request)
    {
        var filter = Builders<StudyGroup>.Filter.Eq(g => g.Id, request.GroupId);
        var update = Builders<StudyGroup>.Update.PullFilter(g => g.Members, m => m.Email == request.Email);
        await _groups.UpdateOneAsync(filter, update);
        return Ok();
    }
}

// --- JoinRequest-la Subject-ai add seithu irukken (400 error solve aagum) ---
public class JoinRequest {
    public string Email { get; set; }
    public string JoinCode { get; set; }
    public string PhoneNumber { get; set; }
    public string Subject { get; set; } 
}

public class UpdateRequest {
    public string GroupName { get; set; }
    public string Description { get; set; }
    public string PhoneNumber { get; set; }
}

public class LeaveRequest {
    public string GroupId { get; set; }
    public string Email { get; set; }
}