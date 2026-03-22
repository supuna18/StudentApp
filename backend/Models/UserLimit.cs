using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StudentApp.Api.Models;

public class UserLimit
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [Required]
    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [BsonElement("domain")]
    public string Domain { get; set; } = string.Empty;

    [Required]
    [Range(1, 1440)]
    [BsonElement("limitMinutes")]
    public int LimitMinutes { get; set; }
}