using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace StudentApp.Api.Models;

[BsonIgnoreExtraElements]
public class ChatMessage
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string GroupId { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    // --- INTHA 3 LINES THAAN MISSING ---
    // WhatsApp style attachments-ku idhu kandippa venum
    public string? FileData { get; set; } 
    public string? FileName { get; set; }
    public string? FileType { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}