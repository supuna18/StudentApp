using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StudentApp.Api.Models;

public class StudyGroup
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string CreatedBy { get; set; } = null!;
    public string JoinCode { get; set; } = null!;
    public List<Member> Members { get; set; } = new();
}

public class Member
{
    public string Username { get; set; } = null!;
    public string Phone { get; set; } = null!;
}

// This helper class is needed for the Join API
public class JoinRequest
{
    public string Username { get; set; } = null!;
    public string Phone { get; set; } = null!;
}