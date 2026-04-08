using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;

namespace StudentApp.Api.Models;

public class BloomDailyLog
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    public DateTime Date { get; set; }

    public string Flow { get; set; } = "None";

    public string Mood { get; set; } = "Balanced";

    public string Note { get; set; } = string.Empty;

    public List<string> Symptoms { get; set; } = new List<string>();

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
