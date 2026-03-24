using StudentApp.Api.Models;
using MongoDB.Driver;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudentApp.Api.Services
{
    public class WellbeingService 
    {
        private readonly IMongoCollection<UserLimit> _userLimitsCollection;
        private readonly IMongoDatabase _database;

        public WellbeingService(IConfiguration config)
        {
            var client = new MongoClient(config.GetSection("StudentDatabase")["ConnectionString"]);
            _database = client.GetDatabase(config.GetSection("StudentDatabase")["DatabaseName"]);
            
            // UserLimits Collection එක ගන්නවා
            _userLimitsCollection = _database.GetCollection<UserLimit>("UserLimits");
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
            // Use raw BsonDocument to avoid issues with fields added after initial schema
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
            var collection = _database.GetCollection<DailyUsage>("DailyUsage");
            
            // අද දිනට අදාල User සහ Domain එක දැනටමත් තියෙනවාද බලන්න Filter එකක් හදනවා
            var filter = Builders<DailyUsage>.Filter.Eq(u => u.UserId, usage.UserId) & 
                         Builders<DailyUsage>.Filter.Eq(u => u.Domain, usage.Domain) &
                         Builders<DailyUsage>.Filter.Eq(u => u.Date, usage.Date);

            // තියෙනවා නම් MinutesSpent එක විතරක් Update කරනවා
            var update = Builders<DailyUsage>.Update.Set(u => u.MinutesSpent, usage.MinutesSpent);
            
            // IsUpsert = true නිසා, නැති එකක් නම් අලුතින් හදනවා, තිබේ නම් Update කරනවා
            await collection.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true });
        }

        public async Task<List<DailyUsage>> GetUsageByUserAsync(string userId) =>
            await _database.GetCollection<DailyUsage>("DailyUsage")
                          .Find(u => u.UserId == userId)
                          .ToListAsync();
    }
}
