using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;
using System;

namespace StudentApp.Api.Models
{
    public class WellbeingProfile
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string UserId { get; set; } = null!; // සාමාන්‍ය string එකක් (උදා: user123)
        
        public int FocusStreak { get; set; } = 0;
        
        public List<string> UnlockedBadges { get; set; } = new List<string>();
        
        public DateTime? LastFocusDate { get; set; }
    }
}
