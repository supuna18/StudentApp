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
    // UserId එක පාවිච්චි කරලා record එක හොයනවා
    var filter = Builders<HabitStatus>.Filter.Eq(h => h.UserId, status.UserId);
    
    // වැදගත්ම දේ: අපි අලුතින් record එකක් දානකොට, 
    // පරණ Id එකක් (null හෝ හිස් එකක්) තිබුණොත් ඒක අයින් කරන්න ඕනේ.
    // එතකොට තමයි MongoDB විසින් අලුත් ObjectId එකක් හදන්නේ.
    if (string.IsNullOrEmpty(status.Id) || status.Id == "null") 
    {
        status.Id = null; 
    }

    status.UpdatedAt = DateTime.UtcNow;

    // ReplaceOptions { IsUpsert = true } මගින් තමයි 
    // අලුත් කෙනෙක් නම් අලුත් record එකක් හදන්නේ.
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
