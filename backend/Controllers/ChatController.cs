using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StudentApp.Api.Data;
using StudentApp.Api.Models;

namespace StudentApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IMongoCollection<ChatMessage> _chats;

    public ChatController(MongoService mongoService)
    {
        _chats = mongoService.ChatHistory;
    }

    // Indha API thaan history-ah fetch pannum
    [HttpGet("history/{groupId}")]
    public async Task<IActionResult> GetChatHistory(string groupId)
    {
        // Simple logic: Fetch all messages for this group
        // Note: Join date filter venum-na, user join panna timestamp-ah inga condition-ah add pannalam.
        var messages = await _chats.Find(m => m.GroupId == groupId)
                                   .SortBy(m => m.Timestamp)
                                   .ToListAsync();
        return Ok(messages);
    }
}