using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StudentApp.Api.Models;

public class HabitStatus
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [Required]
    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [BsonElement("habitType")]
    public string HabitType { get; set; } = "Smoking"; // e.g. "Smoking" or "Drinking"

    [BsonElement("dailyAmount")]
    public double DailyAmount { get; set; } // e.g. 15 cigarettes or 3 units

    [BsonElement("yearsActive")]
    public double YearsActive { get; set; } // Years habit existed

    [BsonElement("unitPrice")]
    public double UnitPrice { get; set; } // Price per unit/pack

    [BsonElement("quitDate")]
    public DateTime QuitDate { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
