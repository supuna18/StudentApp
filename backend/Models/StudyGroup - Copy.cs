using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace StudentApp.Api.Models;

public class StudyGroup
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string GroupName { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string Subject { get; set; } = string.Empty;

    [Required]
    public string CreatedByEmail { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string PhoneNumber { get; set; } = string.Empty;

    public string JoinCode { get; set; } = string.Empty;

    public List<MemberDetail> Members { get; set; } = new();
}

// --- Member Details (combined version) ---
public class MemberDetail
{
    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string Phone { get; set; } = string.Empty;
}

// --- Join Request ---
public class JoinRequest
{
    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string JoinCode { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string PhoneNumber { get; set; } = string.Empty;

    public string Subject { get; set; } = string.Empty;
}