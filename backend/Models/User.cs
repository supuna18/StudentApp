using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic; // එකතු කළා

namespace StudentApp.Api.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    // "Student" or "Admin" selecting the role of the user, default is "Student"
    public string Role { get; set; } = "Student";

    // --- NEW ADDITIONS FOR MEMBER 2 (Music Preferences) ---
    public List<string> FavoriteGenres { get; set; } = new List<string>();
    public string PreferredMood { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}