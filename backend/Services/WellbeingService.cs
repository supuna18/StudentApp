using StudentApp.Api.Models;
using MongoDB.Driver;

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

        // 1. අලුත් Limit එකක් MongoDB එකට දාන්න
        public async Task CreateLimitAsync(UserLimit newLimit) =>
            await _userLimitsCollection.InsertOneAsync(newLimit);

        // 2. ළමයාගේ Limits ලිස්ට් එක ලබාගන්න (Extension එකට අවශ්‍යයි)
        public async Task<List<UserLimit>> GetLimitsByUserAsync(string userId) =>
            await _userLimitsCollection.Find(x => x.UserId == userId).ToListAsync();

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
    }
}