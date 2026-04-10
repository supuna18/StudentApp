using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StudentApp.Api.Data;
using StudentApp.Api.Models;

namespace StudentApp.Api.Controllers;

[Route("api/studygroups")] 
[ApiController]
public class StudyGroupsController : ControllerBase
{
    private readonly IMongoCollection<StudyGroup> _groups;
    private readonly IMongoCollection<ChatMessage> _chats;

    public StudyGroupsController(MongoService mongoService)
    {
        _groups = mongoService.StudyGroups;
        _chats = mongoService.ChatHistory;
    }

    [HttpGet("user/{email}")]
    public async Task<ActionResult<List<StudyGroup>>> GetUserGroups(string email)
    {
        try {
            var filter = Builders<StudyGroup>.Filter.Or(
                Builders<StudyGroup>.Filter.Eq(g => g.CreatedByEmail, email.ToLower()),
                Builders<StudyGroup>.Filter.ElemMatch(g => g.Members, m => m.Email == email.ToLower())
            );
            return await _groups.Find(filter).ToListAsync();
        } catch (Exception ex) { return StatusCode(500, ex.Message); }
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] StudyGroup group)
    {
        try {
            group.Id = null; 
            var random = new Random();
            group.JoinCode = random.Next(100000, 999999).ToString();
            group.CreatedByEmail = group.CreatedByEmail.ToLower(); // Standardize
            group.Members = new List<MemberDetail>();
            await _groups.InsertOneAsync(group);
            return Ok(new { otp = group.JoinCode });
        } catch (Exception ex) { return StatusCode(500, "Error: " + ex.Message); }
    }

    [HttpPost("join")]
    public async Task<IActionResult> Join([FromBody] JoinRequest request)
    {
        var group = await _groups.Find(g => g.JoinCode == request.JoinCode && g.GroupName == request.Subject).FirstOrDefaultAsync();
        if (group == null) return BadRequest(new { message = "Invalid Code!" });

        string reqEmail = request.Email.ToLower();
        if (group.Members.Any(m => m.Email == reqEmail))
            return Ok(new { message = "Already a member", groupId = group.Id });

        var newMember = new MemberDetail { 
            Email = reqEmail, 
            Phone = request.PhoneNumber, 
            JoinedAt = DateTime.UtcNow 
        };

        var update = Builders<StudyGroup>.Update.Push(g => g.Members, newMember);
        await _groups.UpdateOneAsync(g => g.Id == group.Id, update);
        return Ok(new { message = "Joined Successfully!", groupId = group.Id });
    }

    [HttpGet("chat/history/{groupId}/{email}")]
    public async Task<IActionResult> GetChatHistory(string groupId, string email)
    {
        try {
            var group = await _groups.Find(g => g.Id == groupId).FirstOrDefaultAsync();
            if (group == null) return NotFound("Group not found");

            string reqEmail = email.ToLower();
            bool isOwner = group.CreatedByEmail.Equals(reqEmail, StringComparison.OrdinalIgnoreCase);
            DateTime? filterDate = null;

            if (!isOwner) {
                var member = group.Members?.FirstOrDefault(m => m.Email.Equals(reqEmail, StringComparison.OrdinalIgnoreCase));
                if (member != null) {
                    filterDate = member.JoinedAt.AddMinutes(-1); // 1 min buffer
                } else {
                    return Unauthorized("Not a member of this circle");
                }
            }

            var filter = Builders<ChatMessage>.Filter.Eq(m => m.GroupId, groupId);
            if (filterDate.HasValue) {
                filter &= Builders<ChatMessage>.Filter.Gte(m => m.Timestamp, filterDate.Value);
            }

            var messages = await _chats.Find(filter).SortBy(m => m.Timestamp).ToListAsync();
            return Ok(messages);
        } catch (Exception ex) { return StatusCode(500, ex.Message); }
    }

[HttpPost("chat/delete-for-me")]
public async Task<IActionResult> DeleteForMe([FromQuery] string messageId, [FromQuery] string userEmail)
{
    try {
        var filter = Builders<ChatMessage>.Filter.Eq(m => m.Id, messageId);
        // Message-ah delete panna koodathu, unga email-ah mattum 'DeletedForUsers' list-kulla push panna num
        var update = Builders<ChatMessage>.Update.Push(m => m.DeletedForUsers, userEmail.ToLower());
        await _chats.UpdateOneAsync(filter, update);
        return Ok();
    } catch (Exception ex) { return StatusCode(500, ex.Message); }
}

[HttpDelete("chat/delete-for-everyone/{messageId}")]
public async Task<IActionResult> DeleteForEveryone(string messageId)
{
    try {
        // 1. Database-la irundhu message-ah delete panrom
        var result = await _chats.DeleteOneAsync(m => m.Id == messageId);
        
        if (result.DeletedCount > 0) return Ok(new { message = "Deleted" });
        return NotFound();
    } catch (Exception ex) { return StatusCode(500, ex.Message); }
}

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id) {
        await _groups.DeleteOneAsync(g => g.Id == id);
        return Ok();
    }

    
}