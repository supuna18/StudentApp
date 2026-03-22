using Microsoft.AspNetCore.SignalR;
using MongoDB.Driver;
using StudentApp.Api.Data;
using StudentApp.Api.Models;

namespace StudentApp.Api.Hubs;

public class ChatHub : Hub
{
    private readonly IMongoCollection<ChatMessage> _chats;

    public ChatHub(MongoService mongoService)
    {
        // MongoService-la namba add panna ChatHistory collection-ah initialize pannurom
        _chats = mongoService.ChatHistory;
    }

    // 1. Group-kulla enter aagumbodhu andha specific group logic-ah connect pannurom
    public async Task JoinGroup(string groupId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
    }

    // 2. Message anuppumbodhu: DB-la save pannittu broadcast pannuvom
    public async Task SendMessage(string groupId, string user, string message)
    {
        var chatMsg = new ChatMessage
        {
            GroupId = groupId,
            SenderEmail = user,
            Message = message,
            Timestamp = DateTime.UtcNow
        };

        // --- WHATSAPP LOGIC: SAVE TO MONGODB ---
        await _chats.InsertOneAsync(chatMsg);

        // --- BROADCAST: Send to everyone in the group ---
        // Inga namba Timestamp-ahyum sethu anuppurom, appo thaan real-time-la time kaatta mudiyum
        await Clients.Group(groupId).SendAsync("ReceiveMessage", user, message, chatMsg.Timestamp);
    }
}