using StudentApp.Api.Models;
using MongoDB.Driver;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using MongoDB.Bson;

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
        
        // Find existing record to preserve its _id, or generate a new one if it's a new user
        var existing = await _habitCollection.Find(filter).FirstOrDefaultAsync();
        if (existing != null)
        {
            status.Id = existing.Id; // Keep the original MongoDB _id
        }
        else
        {
            status.Id = ObjectId.GenerateNewId().ToString(); // Generate a valid ObjectId instead of null
        }

        status.UpdatedAt = DateTime.UtcNow;

        await _habitCollection.ReplaceOneAsync(filter, status, new ReplaceOptions { IsUpsert = true });
    }

    public async Task DeleteStatusAsync(string userId)
    {
        await _habitCollection.DeleteOneAsync(h => h.UserId == userId);
    }

    public async Task AddOrUpdateLogAsync(string userId, DailyLog log)
    {
        var status = await GetStatusAsync(userId);
        if (status == null) return;

        var existingLog = status.DailyLogs.FirstOrDefault(l => l.Id == log.Id);
        if (existingLog != null)
        {
            existingLog.Date = log.Date;
            existingLog.Count = log.Count;
            existingLog.UnitPrice = log.UnitPrice;
        }
        else
        {
            status.DailyLogs.Add(log);
        }

        status.UpdatedAt = DateTime.UtcNow;
        await UpsertStatusAsync(status);
    }

    public async Task DeleteLogAsync(string userId, string logId)
    {
        var status = await GetStatusAsync(userId);
        if (status == null) return;

        status.DailyLogs.RemoveAll(l => l.Id == logId);
        status.UpdatedAt = DateTime.UtcNow;
        await UpsertStatusAsync(status);
    }
}
