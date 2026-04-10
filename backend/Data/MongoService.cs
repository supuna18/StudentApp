using MongoDB.Driver;
using MongoDB.Bson;
using StudentApp.Api.Models;

namespace StudentApp.Api.Data;

public class MongoService
{
    private readonly IMongoDatabase _database;
    private readonly IMongoCollection<User> _usersCollection;
    private readonly IMongoCollection<StudyGroup> _studyGroupsCollection;
    private readonly IMongoCollection<StudySession> _studySessionsCollection;
    private readonly IMongoCollection<ChatMessage> _chatMessagesCollection;
    private readonly IMongoCollection<SafetyReport> _safetyReportsCollection;
    private readonly IMongoCollection<UserLimit> _userLimitsCollection;
    private readonly IMongoCollection<SystemLog> _systemLogsCollection;
    private readonly IMongoCollection<Resource> _resourcesCollection;
    private readonly IMongoCollection<BloomPeriod> _bloomPeriodsCollection;
    private readonly IMongoCollection<BloomSettings> _bloomSettingsCollection;
    private readonly IMongoCollection<BloomDailyLog> _bloomDailyLogsCollection;

    private static readonly DateTime _serverStartTime = DateTime.UtcNow;

    public MongoService(IMongoClient client, IConfiguration config)
    {
        var databaseName = config.GetSection("StudentDatabase")["DatabaseName"] ?? "EduSyncDB";
        _database = client.GetDatabase(databaseName);

        var usersCollectionName = config.GetSection("StudentDatabase")["CollectionName"] ?? "Users";
        _usersCollection = _database.GetCollection<User>(usersCollectionName);

        var groupsCollectionName = config.GetSection("StudentDatabase")["GroupsCollectionName"] ?? "StudyGroups";
        _studyGroupsCollection = _database.GetCollection<StudyGroup>(groupsCollectionName);

        _studySessionsCollection = _database.GetCollection<StudySession>("StudySessions");
        _chatMessagesCollection = _database.GetCollection<ChatMessage>("ChatMessages");

        var reportsCollectionName = config.GetSection("StudentDatabase")["ReportsCollectionName"] ?? "SafetyReports";
        _safetyReportsCollection = _database.GetCollection<SafetyReport>(reportsCollectionName);

        var limitsCollectionName = config.GetSection("StudentDatabase")["UserLimitsCollection"] ?? "UserLimits";
        _userLimitsCollection = _database.GetCollection<UserLimit>(limitsCollectionName);

        _systemLogsCollection = _database.GetCollection<SystemLog>("SystemLogs");

        var resourcesCollectionName = config.GetSection("StudentDatabase")["ResourcesCollectionName"] ?? "Resources";
        _resourcesCollection = _database.GetCollection<Resource>(resourcesCollectionName);

        _bloomPeriodsCollection = _database.GetCollection<BloomPeriod>("BloomPeriods");
        _bloomSettingsCollection = _database.GetCollection<BloomSettings>("BloomSettings");
        _bloomDailyLogsCollection = _database.GetCollection<BloomDailyLog>("BloomDailyLogs");
    }

    // --- Collections ---
    public IMongoCollection<User> Users => _usersCollection;
    public IMongoCollection<StudyGroup> StudyGroups => _studyGroupsCollection;
    public IMongoCollection<StudySession> StudySessions => _studySessionsCollection;
    public IMongoCollection<ChatMessage> ChatHistory => _chatMessagesCollection;
    public IMongoCollection<SafetyReport> SafetyReports => _safetyReportsCollection;
    public IMongoCollection<UserLimit> UserLimits => _userLimitsCollection;
    public IMongoCollection<SystemLog> SystemLogs => _systemLogsCollection;

    // --- User Operations ---
    public async Task CreateUserAsync(User newUser) =>
        await _usersCollection.InsertOneAsync(newUser);

    public async Task<User?> GetUserByEmailAsync(string email) =>
        await _usersCollection.Find(u => u.Email == email).FirstOrDefaultAsync();

    public async Task<List<User>> GetAllUsersAsync() =>
        await _usersCollection.Find(_ => true).ToListAsync();

    public async Task<bool> UpdateUserAsync(string id, User updatedUser)
    {
        var result = await _usersCollection.ReplaceOneAsync(u => u.Id == id, updatedUser);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var result = await _usersCollection.DeleteOneAsync(u => u.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<User?> GetUserByIdAsync(string id) =>
        await _usersCollection.Find(u => u.Id == id).FirstOrDefaultAsync();

    // --- Safety Report Operations ---
    public async Task<List<SafetyReport>> GetAllSafetyReportsAsync() =>
        await _safetyReportsCollection.Find(_ => true).ToListAsync();

    public async Task<bool> UpdateSafetyReportStatusAsync(string id, string status)
    {
        var filter = Builders<SafetyReport>.Filter.Eq(r => r.Id, id);
        var update = Builders<SafetyReport>.Update.Set(r => r.Status, status);
        var result = await _safetyReportsCollection.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteSafetyReportAsync(string id)
    {
        var result = await _safetyReportsCollection.DeleteOneAsync(r => r.Id == id);
        return result.DeletedCount > 0;
    }

    // --- System Health ---
    public async Task<object> GetSystemHealthAsync()
    {
        bool dbResponsive = false;
        try
        {
            await _database.RunCommandAsync((Command<BsonDocument>)"{ping:1}");
            dbResponsive = true;
        }
        catch { dbResponsive = false; }

        var totalUsers = await _usersCollection.CountDocumentsAsync(new BsonDocument());
        var lastLogs = await _systemLogsCollection.Find(new BsonDocument())
                                                 .SortByDescending(l => l.Timestamp)
                                                 .Limit(10)
                                                 .ToListAsync();

        var uptime = DateTime.UtcNow - _serverStartTime;

        return new
        {
            dbStatus = dbResponsive ? "Online" : "Offline",
            serverTime = DateTime.UtcNow,
            uptime = $"{uptime.Days}d {uptime.Hours}h {uptime.Minutes}m",
            totalUsers,
            recentLogs = lastLogs
        };
    }

    public async Task LogActivityAsync(string activity, string details, string severity = "Info")
    {
        var log = new SystemLog
        {
            Activity = activity,
            Details = details,
            Severity = severity,
            Timestamp = DateTime.UtcNow
        };
        await _systemLogsCollection.InsertOneAsync(log);
    }

    // --- Admin Dashboard Stats ---
    public async Task<object> GetAdminStatsAsync()
    {
        var totalStudents = await _usersCollection.CountDocumentsAsync(u => u.Role == "Student");
        var activeBlocks = await _userLimitsCollection.CountDocumentsAsync(new BsonDocument());
        var pendingReports = await _safetyReportsCollection.CountDocumentsAsync(r => r.Status == "Pending");

        return new
        {
            totalStudents,
            activeBlocks,
            pendingReports,
            systemHealth = "99.9%"
        };
    }

    public async Task<object> GetSystemUsageTrendsAsync()
    {
        var trendsDocs = await _userLimitsCollection.Aggregate()
            .Group(new BsonDocument { { "_id", "$domain" }, { "count", new BsonDocument("$sum", 1) } })
            .Sort(new BsonDocument("count", -1))
            .Limit(5)
            .ToListAsync();
            
        return trendsDocs.Select(doc => new {
            domain = doc["_id"].IsBsonNull ? "Unknown" : doc["_id"].AsString,
            count = doc["count"].AsInt32
        }).ToList();
    }

    public async Task<object> GetResourceDistributionAsync()
    {
        var approved = await _resourcesCollection.CountDocumentsAsync(r => r.IsApproved);
        var pending = await _resourcesCollection.CountDocumentsAsync(r => !r.IsApproved);

        // Also group by FileType or Category? Let's group by FileType
        var byTypeDocs = await _resourcesCollection.Aggregate()
            .Group(new BsonDocument { { "_id", "$FileType" }, { "count", new BsonDocument("$sum", 1) } })
            .ToListAsync();

        var byType = byTypeDocs.Select(doc => new {
            _id = doc["_id"].IsBsonNull ? "Unknown" : doc["_id"].AsString,
            count = doc["count"].AsInt32
        }).ToList();

        return new { approved, pending, byType };
    }

    public async Task<object> GetSafetyReportStatusDistributionAsync()
    {
        var pending = await _safetyReportsCollection.CountDocumentsAsync(r => r.Status == "Pending");
        var approved = await _safetyReportsCollection.CountDocumentsAsync(r => r.Status == "Approved");
        var blocked = await _safetyReportsCollection.CountDocumentsAsync(r => r.Status == "Blocked");
        return new { pending, approved, blocked };
    }

    public async Task<List<object>> GetWeeklyActivityTrendsAsync(int weeks = 4)
    {
        var trends = new List<object>();
        for (int i = weeks - 1; i >= 0; i--)
        {
            var end = DateTime.UtcNow.AddDays(-7 * i);
            var start = end.AddDays(-7);

            // Cumulative students up to 'end'
            var studentCount = await _usersCollection.CountDocumentsAsync(u => u.Role == "Student" && u.CreatedAt <= end);
            var reportCount = await _safetyReportsCollection.CountDocumentsAsync(r => r.ReportedAt >= start && r.ReportedAt <= end);

            trends.Add(new
            {
                label = end.ToString("MMM dd"), // Better label for weekly
                students = (int)studentCount,
                reports = (int)reportCount
            });
        }
        return trends;
    }

    public async Task<List<object>> GetMonthlyActivityTrendsAsync(int months = 6)
    {
        var trends = new List<object>();
        for (int i = months - 1; i >= 0; i--)
        {
            var date = DateTime.UtcNow.AddMonths(-i);
            var monthStart = new DateTime(date.Year, date.Month, 1);
            var monthEnd = monthStart.AddMonths(1).AddTicks(-1);

            // Cumulative students up to 'monthEnd'
            var studentCount = await _usersCollection.CountDocumentsAsync(u => u.Role == "Student" && u.CreatedAt <= monthEnd);
            var reportCount = await _safetyReportsCollection.CountDocumentsAsync(r => r.ReportedAt >= monthStart && r.ReportedAt <= monthEnd);

            trends.Add(new
            {
                label = date.ToString("MMM"),
                students = (int)studentCount,
                reports = (int)reportCount
            });
        }
        return trends;
    }
    // --- Resource Operations ---
    public async Task<List<Resource>> GetAllResourcesAsync() =>
        await _resourcesCollection.Find(_ => true).ToListAsync();

    public async Task CreateResourceAsync(Resource resource) =>
        await _resourcesCollection.InsertOneAsync(resource);

    public async Task<bool> DeleteResourceAsync(string id)
    {
        var result = await _resourcesCollection.DeleteOneAsync(r => r.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<Resource?> GetResourceByIdAsync(string id) =>
        await _resourcesCollection.Find(r => r.Id == id).FirstOrDefaultAsync();

    public async Task<bool> UpdateResourceAsync(string id, Resource updatedResource)
    {
        var result = await _resourcesCollection.ReplaceOneAsync(r => r.Id == id, updatedResource);
        return result.ModifiedCount > 0;
    }

    // --- Bloom Operations ---
    public async Task<List<BloomPeriod>> GetBloomPeriodsAsync(string userId) =>
        await _bloomPeriodsCollection.Find(p => p.UserId == userId).ToListAsync();

    public async Task CreateBloomPeriodAsync(BloomPeriod period) =>
        await _bloomPeriodsCollection.InsertOneAsync(period);

    public async Task<bool> UpdateBloomPeriodAsync(string id, BloomPeriod updatedPeriod)
    {
        var result = await _bloomPeriodsCollection.ReplaceOneAsync(p => p.Id == id, updatedPeriod);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteBloomPeriodAsync(string id)
    {
        var result = await _bloomPeriodsCollection.DeleteOneAsync(p => p.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<List<BloomDailyLog>> GetBloomDailyLogsAsync(string userId) =>
        await _bloomDailyLogsCollection.Find(l => l.UserId == userId).ToListAsync();

    public async Task CreateOrUpdateBloomDailyLogAsync(string userId, DateTime date, BloomDailyLog log)
    {
        var filter = Builders<BloomDailyLog>.Filter.And(
            Builders<BloomDailyLog>.Filter.Eq(l => l.UserId, userId),
            Builders<BloomDailyLog>.Filter.Eq(l => l.Date, date.Date)
        );

        var update = Builders<BloomDailyLog>.Update
            .Set(l => l.Flow, log.Flow)
            .Set(l => l.Mood, log.Mood)
            .Set(l => l.Note, log.Note)
            .Set(l => l.Symptoms, log.Symptoms)
            .Set(l => l.UpdatedAt, DateTime.UtcNow)
            .SetOnInsert(l => l.UserId, userId)
            .SetOnInsert(l => l.Date, date.Date);

        await _bloomDailyLogsCollection.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true });
    }

    public async Task<bool> DeleteBloomDailyLogAsync(string userId, DateTime date)
    {
        var filter = Builders<BloomDailyLog>.Filter.And(
            Builders<BloomDailyLog>.Filter.Eq(l => l.UserId, userId),
            Builders<BloomDailyLog>.Filter.Eq(l => l.Date, date.Date)
        );
        var result = await _bloomDailyLogsCollection.DeleteOneAsync(filter);
        return result.DeletedCount > 0;
    }

    public async Task<BloomSettings?> GetBloomSettingsAsync(string userId) =>
        await _bloomSettingsCollection.Find(s => s.UserId == userId).FirstOrDefaultAsync();

    public async Task SaveBloomSettingsAsync(BloomSettings settings)
    {
        var filter = Builders<BloomSettings>.Filter.Eq(s => s.UserId, settings.UserId);
        var update = Builders<BloomSettings>.Update
            .Set(s => s.PeriodDuration, settings.PeriodDuration)
            .SetOnInsert(s => s.UserId, settings.UserId);

        await _bloomSettingsCollection.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true });
    }
}
