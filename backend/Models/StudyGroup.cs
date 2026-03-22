using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StudentApp.Api.Models;

public class StudyGroup
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string CreatedBy { get; set; } = string.Empty;

    [Required]
    public string JoinCode { get; set; } = string.Empty;

    public List<Member> Members { get; set; } = new();
}

public class Member
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string Phone { get; set; } = string.Empty;
}

public class JoinRequest
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string Phone { get; set; } = string.Empty;
}