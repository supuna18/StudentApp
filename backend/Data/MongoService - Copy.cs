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

    public MongoService(IMongoClient client, IConfiguration config)
    {
        var databaseName = config.GetSection("StudentDatabase")["DatabaseName"] ?? "EduSyncDB";
        _database = client.GetDatabase(databaseName);

        var usersCollectionName = config.GetSection("StudentDatabase")["CollectionName"] ?? "Users";
        _usersCollection = _database.GetCollection<User>(usersCollectionName);

        var groupsCollectionName = config.GetSection("StudentDatabase")["GroupsCollectionName"] ?? "StudyGroups";
        _studyGroupsCollection = _database.GetCollection<StudyGroup>(groupsCollectionName);

        var sessionsCollectionName = "StudySessions";
        _studySessionsCollection = _database.GetCollection<StudySession>(sessionsCollectionName);

        var chatCollectionName = "ChatMessages";
        _chatMessagesCollection = _database.GetCollection<ChatMessage>(chatCollectionName);

        var reportsCollectionName = config.GetSection("StudentDatabase")["ReportsCollectionName"] ?? "SafetyReports";
        _safetyReportsCollection = _database.GetCollection<SafetyReport>(reportsCollectionName);

        var limitsCollectionName = config.GetSection("StudentDatabase")["UserLimitsCollection"] ?? "UserLimits";
        _userLimitsCollection = _database.GetCollection<UserLimit>(limitsCollectionName);
    }

    // --- Collections ---
    public IMongoCollection<User> Users => _usersCollection;
    public IMongoCollection<StudyGroup> StudyGroups => _studyGroupsCollection;
    public IMongoCollection<StudySession> StudySessions => _studySessionsCollection;
    public IMongoCollection<ChatMessage> ChatHistory => _chatMessagesCollection;
    public IMongoCollection<SafetyReport> SafetyReports => _safetyReportsCollection;
    public IMongoCollection<UserLimit> UserLimits => _userLimitsCollection;

    // --- User Operations ---
    public async Task CreateUserAsync(User newUser) =>
        await _usersCollection.InsertOneAsync(newUser);

    public async Task<User?> GetUserByEmailAsync(string email) =>
        await _usersCollection.Find(u => u.Email == email).FirstOrDefaultAsync();

    public async Task<List<User>> GetAllUsersAsync() =>
        await _usersCollection.Find(_ => true).ToListAsync();

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
}