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
        _chats = mongoService.ChatHistory;
    }

    public async Task JoinGroup(string groupId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
    }

    public async Task SendMessage(string groupId, string user, string message, string? fileData = null, string? fileName = null, string? fileType = null)
    {
        var chatMsg = new ChatMessage
        {
            GroupId = groupId,
            SenderEmail = user,
            Message = message,
            FileData = fileData,
            FileName = fileName,
            FileType = fileType,
            Timestamp = DateTime.UtcNow
        };

        await _chats.InsertOneAsync(chatMsg);
        await Clients.Group(groupId).SendAsync("ReceiveMessage", user, message, chatMsg.Timestamp, fileData, fileName, fileType);
    }
}``