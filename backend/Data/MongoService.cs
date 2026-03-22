using MongoDB.Driver;
using MongoDB.Bson;
using StudentApp.Api.Models;

namespace StudentApp.Api.Data;

public class MongoService
{
    private readonly IMongoDatabase _database;
    private readonly IMongoCollection<User> _usersCollection;
    private readonly IMongoCollection<StudyGroup> _studyGroupsCollection;

    public MongoService(IMongoClient client, IConfiguration config)
    {
        var databaseName = config.GetSection("StudentDatabase:DatabaseName").Value;
        _database = client.GetDatabase(databaseName);

        var usersCollectionName = config.GetSection("StudentDatabase:CollectionName").Value;
        _usersCollection = _database.GetCollection<User>(usersCollectionName);

        var groupsCollectionName = config.GetSection("StudentDatabase:GroupsCollectionName")?.Value ?? "StudyGroups";
        _studyGroupsCollection = _database.GetCollection<StudyGroup>(groupsCollectionName);
    }

    // --- මූලික Properties ---
    public IMongoCollection<StudyGroup> StudyGroups => _studyGroupsCollection;

    // --- User Management (Auth) ---
    public async Task CreateUserAsync(User newUser) =>
        await _usersCollection.InsertOneAsync(newUser);

    public async Task<User?> GetUserByEmailAsync(string email) =>
        await _usersCollection.Find(u => u.Email == email).FirstOrDefaultAsync();

    public async Task<List<User>> GetAllUsersAsync() =>
        await _usersCollection.Find(_ => true).ToListAsync();

    // --- Admin Intelligence Logic (Member 4 විශේෂාංග) ---

    public async Task<object> GetAdminStatsAsync()
    {
        // 1. පද්ධතියේ සිටින මුළු ශිෂ්‍ය සංඛ්‍යාව ගණනය කිරීම
        var totalStudents = await _usersCollection.CountDocumentsAsync(u => u.Role == "Student");

        // 2. Member 1 ගේ දත්ත (UsageStats) - දැනට බ්ලොක් කර ඇති සයිට් ගණන
        // සටහන: Member 1 විසින් "UsageStats" නමින් collection එකක් පාවිච්චි කරන බව උපකල්පනය කෙරේ
        var usageCol = _database.GetCollection<BsonDocument>("UsageStats");
        var activeBlocks = await usageCol.CountDocumentsAsync(new BsonDocument());

        // 3. Member 2 ගේ දත්ත (SafetyReports) - තවමත් පරීක්ෂා නොකළ (Pending) රිපෝට් ගණන
        // සටහන: Member 2 විසින් "SafetyReports" නමින් collection එකක් පාවිච්චි කරන බව උපකල්පනය කෙරේ
        var reportsCol = _database.GetCollection<BsonDocument>("SafetyReports");
        var pendingReports = await reportsCol.CountDocumentsAsync(new BsonDocument("status", "Pending"));

        return new
        {
            totalStudents,
            activeBlocks,
            pendingReports,
            systemHealth = "99.9%" // මෙය ස්ථාවර අගයක් ලෙස පෙන්විය හැක
        };
    }

    // අමතර: සියලුම යූසර්ලාගේ දත්ත විශ්ලේෂණය සඳහා (Debug/Admin purposes)
    public async Task<List<BsonDocument>> GetSystemUsageTrendsAsync()
    {
        var usageCol = _database.GetCollection<BsonDocument>("UsageStats");

        // පහුගිය දත්ත වල Trends බැලීමට Aggregation Pipeline එකක් පාවිච්චි කළ හැක
        return await usageCol.Aggregate()
            .Group(new BsonDocument { { "_id", "$domain" }, { "count", new BsonDocument("$sum", 1) } })
            .Sort(new BsonDocument("count", -1))
            .Limit(5)
            .ToListAsync();
    }
}