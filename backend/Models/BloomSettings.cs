using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace StudentApp.Api.Models;

public class BloomSettings
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    public int PeriodDuration { get; set; } = 5;
}
