using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System;

namespace StudentApp.Api.Models;

public class BloomPeriod
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string? UserId { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
