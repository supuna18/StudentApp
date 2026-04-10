using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace StudentApp.Api.Models;

[BsonIgnoreExtraElements] // Indha line romba mukkiyam
public class StudyGroup
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string GroupName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string CreatedByEmail { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string JoinCode { get; set; } = string.Empty;
    public List<MemberDetail> Members { get; set; } = new();
}

public class MemberDetail {
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}

// Request models-ah inga vechukonga
public class JoinRequest {
    public string Email { get; set; } = string.Empty;
    public string JoinCode { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
}

public class UpdateRequest {
    public string GroupName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}

public class LeaveRequest {
    public string GroupId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}