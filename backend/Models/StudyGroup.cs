using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace StudentApp.Api.Models;

public class StudyGroup
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public string GroupName { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string CreatedByEmail { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string? JoinCode { get; set; }
    public List<MemberDetail> Members { get; set; } = new List<MemberDetail>(); 
}

public class MemberDetail {
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
}

public class JoinRequest {
    public string Email { get; set; } = null!;
    public string JoinCode { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string Subject { get; set; } = null!;
}