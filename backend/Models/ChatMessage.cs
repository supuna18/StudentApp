using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace StudentApp.Api.Models;

public class ChatMessage {
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public string GroupId { get; set; } = null!;
    public string SenderEmail { get; set; } = null!;
    public string Message { get; set; } = null!;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}