using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StudentApp.Api.Data;
using StudentApp.Api.Models;
using StudentApp.Api.Services;

namespace StudentApp.Api.Controllers;

[Route("api/[controller]")]
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

    // 1. GET ALL USER GROUPS
    [HttpGet("user/{email}")]
    public async Task<ActionResult<List<StudyGroup>>> GetUserGroups(string email)
    {
        var filter = Builders<StudyGroup>.Filter.Or(
            Builders<StudyGroup>.Filter.Eq(g => g.CreatedByEmail, email),
            Builders<StudyGroup>.Filter.ElemMatch(g => g.Members, m => m.Email == email)
        );
        return await _groups.Find(filter).ToListAsync();
    }

    [HttpGet]
    public async Task<ActionResult<List<StudyGroup>>> Get() =>
        await _groups.Find(_ => true).ToListAsync();


    // 2. GET SINGLE GROUP
    [HttpGet("{id}")]
    public async Task<ActionResult<StudyGroup>> GetById(string id) =>
        await _groups.Find(g => g.Id == id).FirstOrDefaultAsync();

    // 3. FETCH CHAT HISTORY
    [HttpGet("chat/history/{groupId}")]
    public async Task<ActionResult<List<ChatMessage>>> GetChatHistory(string groupId)
    {
        return await _chats.Find(m => m.GroupId == groupId)
                           .SortBy(m => m.Timestamp)
                           .ToListAsync();
    }

    // 4. CREATE GROUP
    [HttpPost("create")]
    public async Task<IActionResult> Create(StudyGroup newGroup)
    {
        newGroup.JoinCode = new Random().Next(100000, 999999).ToString();
        newGroup.Members = new List<MemberDetail> { 
            new MemberDetail { Email = newGroup.CreatedByEmail, Phone = newGroup.PhoneNumber } 
        };

        await _groups.InsertOneAsync(newGroup);
        try { await _emailService.SendOtpEmailAsync(newGroup.CreatedByEmail, newGroup.GroupName, newGroup.JoinCode); }
        catch { }

        return Ok(new { otp = newGroup.JoinCode, groupId = newGroup.Id });
    }

    // 5. JOIN GROUP
    [HttpPost("join")]
    public async Task<IActionResult> Join([FromBody] JoinRequest request)
    {
        var group = await _groups.Find(g => g.JoinCode == request.JoinCode).FirstOrDefaultAsync();
        if (group == null) return BadRequest(new { message = "Invalid Code!" });

        if (group.Members.Any(m => m.Email == request.Email))
            return Ok(new { message = "Already a member", groupId = group.Id });

        var update = Builders<StudyGroup>.Update.Push(g => g.Members, new MemberDetail { Email = request.Email, Phone = request.PhoneNumber });
        await _groups.UpdateOneAsync(g => g.Id == group.Id, update);
        
        return Ok(new { message = "Joined!", groupId = group.Id });
    }

    // --- FIX: EDIT GROUP (Use ReplaceOne for better reliability with MongoDB) ---
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] StudyGroup updatedData)
    {
        var existingGroup = await _groups.Find(g => g.Id == id).FirstOrDefaultAsync();
        if (existingGroup == null) return NotFound(new { message = "Group not found" });

        // Properties-ai update seivom
        existingGroup.GroupName = updatedData.GroupName;
        existingGroup.Description = updatedData.Description;
        existingGroup.PhoneNumber = updatedData.PhoneNumber;
        existingGroup.Subject = updatedData.GroupName; // Subject-um group name-um ondre

        var result = await _groups.ReplaceOneAsync(g => g.Id == id, existingGroup);

        if (result.ModifiedCount == 0) return BadRequest(new { message = "No changes made or update failed" });

        return Ok(new { message = "Updated Successfully!" });
    }

    // --- DELETE GROUP ---
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _groups.DeleteOneAsync(g => g.Id == id);
        return Ok(new { message = "Group Deleted!" });
    }

    // --- LEAVE GROUP ---
    [HttpPost("leave")]
    public async Task<IActionResult> Leave([FromBody] LeaveRequest request)
    {
        var filter = Builders<StudyGroup>.Filter.Eq(g => g.Id, request.GroupId);
        var update = Builders<StudyGroup>.Update.PullFilter(g => g.Members, m => m.Email == request.Email);
        
        await _groups.UpdateOneAsync(filter, update);
        return Ok(new { message = "Left the group!" });
    }
}

public class JoinRequest
{
    public string Email { get; set; }
    public string JoinCode { get; set; }
    public string PhoneNumber { get; set; }
}

public class LeaveRequest
{
    public string GroupId { get; set; }
    public string Email { get; set; }
}