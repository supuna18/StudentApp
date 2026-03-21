using MongoDB.Driver;
using StudentApp.Api.Models;

namespace StudentApp.Api.Data;

public class MongoService
{
    private readonly IMongoCollection<User> _usersCollection;
    private readonly IMongoCollection<StudyGroup> _studyGroupsCollection;

    public MongoService(IMongoClient client, IConfiguration config)
    {
        var databaseName = config.GetSection("StudentDatabase:DatabaseName").Value;
        var database = client.GetDatabase(databaseName);
        
        var usersCollectionName = config.GetSection("StudentDatabase:CollectionName").Value;
        _usersCollection = database.GetCollection<User>(usersCollectionName);

        // Best practice: Read from configuration, fallback if needed
        var groupsCollectionName = config.GetSection("StudentDatabase:GroupsCollectionName")?.Value ?? "StudyGroups";
        _studyGroupsCollection = database.GetCollection<StudyGroup>(groupsCollectionName);
    }

    public IMongoCollection<StudyGroup> StudyGroups => _studyGroupsCollection;

    public async Task CreateUserAsync(User newUser) => 
        await _usersCollection.InsertOneAsync(newUser);

    public async Task<User?> GetUserByEmailAsync(string email) => 
        await _usersCollection.Find(u => u.Email == email).FirstOrDefaultAsync();

    public async Task<List<User>> GetAllUsersAsync() =>
        await _usersCollection.Find(_ => true).ToListAsync();
}
