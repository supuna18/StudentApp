using Microsoft.AspNetCore.SignalR;

namespace StudentApp.Api.Hubs;

public class ChatHub : Hub
{
    // [ADD] Users join a specific group "room" so they only see messages for that group
    public async Task JoinGroup(string groupId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
    }

    // [ADD] Broadcast message to everyone in that specific group room
    public async Task SendMessage(string groupId, string user, string message)
    {
        await Clients.Group(groupId).SendAsync("ReceiveMessage", user, message);
    }
}