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

    // ✅ FIXED (ONLY ONE METHOD)
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
                                                 .Limit(5)
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

    public async Task<List<BsonDocument>> GetSystemUsageTrendsAsync()
    {
        return await _userLimitsCollection.Aggregate()
            .Group(new BsonDocument { { "_id", "$domain" }, { "count", new BsonDocument("$sum", 1) } })
            .Sort(new BsonDocument("count", -1))
            .Limit(5)
            .ToListAsync();
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
}