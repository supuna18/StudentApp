using StudentApp.Api.Models;
using MongoDB.Driver;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace StudentApp.Api.Services;

public class HabitService
{
    private readonly IMongoCollection<HabitStatus> _habitCollection;

    public HabitService(IMongoClient client, IConfiguration config)
    {
        var databaseName = config.GetSection("StudentDatabase")["DatabaseName"] ?? "EduSyncDB";
        var database = client.GetDatabase(databaseName);
        _habitCollection = database.GetCollection<HabitStatus>("HabitRecovery");
    }

    public async Task<HabitStatus?> GetStatusAsync(string userId)
    {
        return await _habitCollection.Find(h => h.UserId == userId).FirstOrDefaultAsync();
    }

    public async Task UpsertStatusAsync(HabitStatus status)
    {
        var filter = Builders<HabitStatus>.Filter.Eq(h => h.UserId, status.UserId);
        status.UpdatedAt = DateTime.UtcNow;
        
        // Upsert logic
        await _habitCollection.ReplaceOneAsync(filter, status, new ReplaceOptions { IsUpsert = true });
    }

    public async Task DeleteStatusAsync(string userId)
    {
        await _habitCollection.DeleteOneAsync(h => h.UserId == userId);
    }
}
