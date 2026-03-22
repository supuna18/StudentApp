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
    private readonly IMongoCollection<ChatMessage> _chats; // ADDED: For chat history
    private readonly EmailService _emailService;

    public StudyGroupsController(MongoService mongoService, EmailService emailService)
    {
        _groups = mongoService.StudyGroups;
        _chats = mongoService.ChatHistory; // ADDED: Initializing chat collection
        _emailService = emailService;
    }


    // 1. GET ALL USER GROUPS (Managed & Joined)
    [HttpGet("user/{email}")]
    public async Task<ActionResult<List<StudyGroup>>> GetUserGroups(string email)
    {
        var filter = Builders<StudyGroup>.Filter.Or(
            Builders<StudyGroup>.Filter.Eq(g => g.CreatedByEmail, email),
            Builders<StudyGroup>.Filter.ElemMatch(g => g.Members, m => m.Email == email)
        );
        return await _groups.Find(filter).ToListAsync();
    }

    // 1. GET ALL: fetch("http://localhost:5005/api/studygroups")
    [HttpGet]
    public async Task<ActionResult<List<StudyGroup>>> Get() =>
        await _groups.Find(_ => true).ToListAsync();


    // 2. GET SINGLE GROUP (For Chat Page Details)
    [HttpGet("{id}")]
    public async Task<ActionResult<StudyGroup>> GetById(string id) =>
        await _groups.Find(g => g.Id == id).FirstOrDefaultAsync();

    // --- 3. ADDED: FETCH CHAT HISTORY (WhatsApp Logic) ---
    [HttpGet("chat/history/{groupId}")]
    public async Task<ActionResult<List<ChatMessage>>> GetChatHistory(string groupId)
    {
        // Fetches all previous messages for this group sorted by time
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
}