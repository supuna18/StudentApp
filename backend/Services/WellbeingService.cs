using StudentApp.Api.Models;
using MongoDB.Driver;

namespace StudentApp.Api.Services // Namespace එක Services විය යුතුයි
{
    public class WellbeingService 
    {
        private readonly IMongoCollection<UserLimit> _userLimitsCollection;

        public WellbeingService(IConfiguration config)
        {
            var client = new MongoClient(config.GetSection("StudentDatabase")["ConnectionString"]);
            var database = client.GetDatabase(config.GetSection("StudentDatabase")["DatabaseName"]);
            
            var collectionName = config.GetSection("StudentDatabase")["UserLimitsCollection"];
            _userLimitsCollection = database.GetCollection<UserLimit>("UserLimits");
        }

        public async Task CreateLimitAsync(UserLimit newLimit) =>
            await _userLimitsCollection.InsertOneAsync(newLimit);
        
        // අලුතින් එකතු කළ යුතු කොටස
public async Task<List<UserLimit>> GetLimitsByUserAsync(string userId) =>
    await _userLimitsCollection.Find(x => x.UserId == userId).ToListAsync();
     
    }
}