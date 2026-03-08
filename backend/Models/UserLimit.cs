using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StudentApp.Api.Models
{
    public class UserLimit
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("userId")]
        public string UserId { get; set; } = null!; // ළමයාගේ ID එක

        [BsonElement("domain")]
        public string Domain { get; set; } = null!; // උදා: facebook.com

        [BsonElement("limitMinutes")]
        public int LimitMinutes { get; set; } // දවසකට දෙන කාලය විනාඩි වලින්
    }
}