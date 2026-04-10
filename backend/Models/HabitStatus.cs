using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StudentApp.Api.Models;

public class HabitStatus
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonIgnoreIfDefault]
    public string? Id { get; set; }

    [Required]
    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [BsonElement("habitType")]
    public string HabitType { get; set; } = "Smoking"; // e.g. "Smoking" or "Drinking"

    [BsonElement("dailyAmount")]
    public double DailyAmount { get; set; } // Baseline cigarettes/drinks per day

    [BsonElement("yearsActive")]
    public double YearsActive { get; set; }

    [BsonElement("unitPrice")]
    public double UnitPrice { get; set; } // Baseline pack/drink price

    [BsonElement("quitDate")]
    public DateTime QuitDate { get; set; } = DateTime.UtcNow;

    [BsonElement("dailyLogs")]
    public List<DailyLog> DailyLogs { get; set; } = new();

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class DailyLog
{
    [BsonElement("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [BsonElement("date")]
    public DateTime Date { get; set; }

    [BsonElement("count")]
    public double Count { get; set; }

    [BsonElement("unitPrice")]
    public double UnitPrice { get; set; }
}
