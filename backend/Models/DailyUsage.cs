using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StudentApp.Api.Models
{
    public class DailyUsage
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string UserId { get; set; } = null!;
        public string Domain { get; set; } = null!;
        public double MinutesSpent { get; set; } // ගත කළ කාලය විනාඩි වලින්
        public string Date { get; set; } = null!; // උදා: "2024-03-05"
    }
}