using StudentApp.Api.Models;
using MongoDB.Driver;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;
using StudentApp.Api.Data;
using System.Linq;
using System;

namespace StudentApp.Api.Services
{
    public class WellbeingService 
    {
        private readonly IMongoCollection<UserLimit> _userLimitsCollection;
        private readonly IMongoCollection<DailyUsage> _dailyUsageCollection;
        private readonly IMongoCollection<WellbeingProfile> _wellbeingProfileCollection;
        private readonly IMongoDatabase _database;

        public WellbeingService(IConfiguration config)
        {
            var connectionString = config.GetSection("StudentDatabase")["ConnectionString"];
            var databaseName = config.GetSection("StudentDatabase")["DatabaseName"] ?? "EduSyncDB";
            
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
            
            var limitsCollectionName = config.GetSection("StudentDatabase")["UserLimitsCollection"] ?? "UserLimits";

            _userLimitsCollection = _database.GetCollection<UserLimit>(limitsCollectionName);
            _dailyUsageCollection = _database.GetCollection<DailyUsage>("DailyUsage");
            _wellbeingProfileCollection = _database.GetCollection<WellbeingProfile>("WellbeingProfiles");
        }

        // 1. අලුත් Limit එකක් MongoDB එකට දාන්න හෝ තිබේ නම් Update කරන්න (Upsert)
        public async Task UpsertLimitAsync(UserLimit limit)
        {
            var filter = Builders<UserLimit>.Filter.Eq(x => x.UserId, limit.UserId) & 
                         Builders<UserLimit>.Filter.Eq(x => x.Domain, limit.Domain);
            
            var update = Builders<UserLimit>.Update
                .Set("limitMinutes", limit.LimitMinutes)
                .Set("category", limit.Category);

            await _userLimitsCollection.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true });
        }

        // Delete a specific limit by its MongoDB _id
        public async Task DeleteLimitAsync(string id)
        {
            var rawCollection = _database.GetCollection<MongoDB.Bson.BsonDocument>("UserLimits");
            var filter = Builders<MongoDB.Bson.BsonDocument>.Filter.Eq("_id", MongoDB.Bson.ObjectId.Parse(id));
            await rawCollection.DeleteOneAsync(filter);
        }

        // 2. ළමයාගේ Limits ලිස්ට් එක ලබාගන්න (Extension එකට අවශ්‍යයි)
        public async Task<List<UserLimit>> GetLimitsByUserAsync(string userId)
        {
            var rawCollection = _database.GetCollection<MongoDB.Bson.BsonDocument>("UserLimits");
            var filter = Builders<MongoDB.Bson.BsonDocument>.Filter.Eq("userId", userId);
            var rawDocs = await rawCollection.Find(filter).ToListAsync();

            return rawDocs.Select(doc => new UserLimit
            {
                Id = doc.Contains("_id") ? doc["_id"].ToString() : null,
                UserId = doc.Contains("userId") ? doc["userId"].AsString : "",
                Domain = doc.Contains("domain") ? doc["domain"].AsString : "",
                LimitMinutes = doc.Contains("limitMinutes") ? doc["limitMinutes"].ToInt32() : 60,
                Category = doc.Contains("category") ? doc["category"].AsString : "Other"
            }).ToList();
        }

        // 3. Extension එකෙන් එන සැබෑ භාවිතය (Usage) සේව් කරන්න හෝ Update කරන්න (Upsert)
        public async Task UpdateUsageAsync(DailyUsage usage)
        {
            var filter = Builders<DailyUsage>.Filter.Eq(u => u.UserId, usage.UserId) & 
                         Builders<DailyUsage>.Filter.Eq(u => u.Domain, usage.Domain) &
                         Builders<DailyUsage>.Filter.Eq(u => u.Date, usage.Date);

            var update = Builders<DailyUsage>.Update.Set(u => u.MinutesSpent, usage.MinutesSpent);
            
            await _dailyUsageCollection.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true });
        }

        public async Task<List<DailyUsage>> GetUsageByUserAsync(string userId) =>
            await _dailyUsageCollection.Find(u => u.UserId == userId).ToListAsync();

        // 4. Wellbeing Profile (Streak/Badges) ලබාගන්න
        public async Task<WellbeingProfile?> GetProfileAsync(string userId)
        {
            return await _wellbeingProfileCollection.Find(u => u.UserId == userId).FirstOrDefaultAsync();
        }

        // 5. Wellbeing Profile (Streak/Badges) Sync කරන්න
        public async Task SyncProfileAsync(string userId, int streak, List<string> badges)
        {
            var filter = Builders<WellbeingProfile>.Filter.Eq(u => u.UserId, userId);
            var update = Builders<WellbeingProfile>.Update
                .Set(u => u.FocusStreak, streak)
                .Set(u => u.UnlockedBadges, badges)
                .Set(u => u.LastFocusDate, DateTime.UtcNow);

            await _wellbeingProfileCollection.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true });
        }
    }
}
