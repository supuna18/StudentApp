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
    
    // ════════════ 1. UPDATED HISTORY LOGIC ════════════
    // Route-la userEmail parameter-ah add panni iruken
    [HttpGet("chat/history/{groupId}/{userEmail}")]
    public async Task<ActionResult<List<ChatMessage>>> GetHistory(string groupId, string userEmail)
    {
        var group = await _groups.Find(g => g.Id == groupId).FirstOrDefaultAsync();
        if (group == null) return NotFound();

        // OWNER-na full history theriyum
        if (group.CreatedByEmail == userEmail)
        {
            return await _chats.Find(c => c.GroupId == groupId)
                               .SortBy(c => c.Timestamp)
                               .ToListAsync();
        }

        // MEMBER-na join panna apparam vandha messages mattum theriya filter panrom
        var member = group.Members.FirstOrDefault(m => m.Email == userEmail);
        if (member == null) return Unauthorized("Join the group first!");

        return await _chats.Find(c => c.GroupId == groupId && c.Timestamp >= member.JoinedAt)
                           .SortBy(c => c.Timestamp)
                           .ToListAsync();
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] StudyGroup group)
    {
        try
        {
            var random = new Random();
            group.JoinCode = random.Next(100000, 999999).ToString();
            group.Members = new List<MemberDetail>();
            
            await _groups.InsertOneAsync(group);
            return Ok(new { otp = group.JoinCode });
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Error creating circle: " + ex.Message);
        }
    }

    // ════════════ 2. UPDATED JOIN METHOD ════════════
    [HttpPost("join")]
    public async Task<IActionResult> Join([FromBody] JoinRequest request)
    {
        var group = await _groups.Find(g => g.JoinCode == request.JoinCode && g.GroupName == request.Subject).FirstOrDefaultAsync();
        
        if (group == null) 
            return BadRequest(new { message = "Invalid Code or Subject Mismatch!" });

        if (group.Members.Any(m => m.Email == request.Email))
            return Ok(new { message = "Already a member", groupId = group.Id });

        // User join pannum podhu current UTC time-ah save panrom
        var update = Builders<StudyGroup>.Update.Push(g => g.Members, new MemberDetail { 
            Email = request.Email, 
            Phone = request.PhoneNumber,
            JoinedAt = DateTime.UtcNow // IDHU THAAN MUKKIYAM
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

// ════════════ 3. UPDATED MODELS ════════════

// MemberDetail class-la JoinedAt property add panni iruken
public class MemberDetail {
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; } 
}

public class JoinRequest {
    public string Email { get; set; } = string.Empty;
    public string JoinCode { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
}

public class UpdateRequest {
    public string GroupName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}

public class LeaveRequest {
    public string GroupId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}