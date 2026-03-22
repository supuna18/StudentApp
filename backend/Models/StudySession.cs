using MongoDB.Bson; // Indha line mukkiyam
using MongoDB.Bson.Serialization.Attributes; // Indha line thaan BsonId-ah kandupudikkum

namespace StudentApp.Api.Models;

public class StudySession
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string UserEmail { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string FromDate { get; set; } = null!;
    public string ToDate { get; set; } = null!;
    public string StartTime { get; set; } = null!;
    public string Duration { get; set; } = null!;
}