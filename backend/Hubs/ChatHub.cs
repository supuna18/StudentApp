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
        try
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

            if (_chats == null) throw new Exception("Database collection not initialized.");

            await _chats.InsertOneAsync(chatMsg);
            
            // Broadcast to group
            await Clients.Group(groupId).SendAsync("ReceiveMessage", user, message, chatMsg.Timestamp, fileData, fileName, fileType, chatMsg.Id);
        }
        catch (Exception ex)
        {
            // This will be visible in the client console if EnableDetailedErrors is on
            throw new HubException($"SendMessage failed: {ex.Message}");
        }
    }

    // ChatHub.cs kulla intha method-ah add pannunga
// ChatHub.cs kulla intha method-ah add pannunga
public async Task DeleteMessage(string groupId, string messageId)
{
    // Intha line thaan group-la ulla maththa members-oda screen-la irundhu andha message bubble-ah remove pannum
    await Clients.Group(groupId).SendAsync("MessageDeleted", messageId);
}
}

    