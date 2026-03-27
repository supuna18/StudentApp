using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic; // එකතු කළා

namespace StudentApp.Api.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = "Student";

    // --- NEW ADDITIONS FOR MEMBER 2 (Music Preferences) ---
    public List<string> FavoriteGenres { get; set; } = new List<string>();
    public string PreferredMood { get; set; } = string.Empty;

    // --- OTP for Password Reset ---
    public string? PasswordResetOTP { get; set; }
    public DateTime? OTPExpiry { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}