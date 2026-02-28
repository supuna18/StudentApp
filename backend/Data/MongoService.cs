using MongoDB.Driver;
using StudentApp.Api.Models;

namespace StudentApp.Api.Data;

public class MongoService
{
    private readonly IMongoCollection<User> _usersCollection;
    private readonly IMongoCollection<StudyGroup> _studyGroupsCollection;

    public MongoService(IConfiguration config)
    {
        var client = new MongoClient(config.GetSection("StudentDatabase:ConnectionString").Value);
        var database = client.GetDatabase(config.GetSection("StudentDatabase:DatabaseName").Value);
        
        // 1. Initializing the Users collection (Leader's code)
        _usersCollection = database.GetCollection<User>(config.GetSection("StudentDatabase:CollectionName").Value);

        // 2. YOU MUST INITIALIZE your StudyGroups collection here:
        _studyGroupsCollection = database.GetCollection<StudyGroup>("StudyGroups");
    }

    // 3. ADD THIS PROPERTY so your Controller can access the data:
    public IMongoCollection<StudyGroup> StudyGroups => _studyGroupsCollection;

    public async Task CreateUserAsync(User newUser) => 
        await _usersCollection.InsertOneAsync(newUser);

    public async Task<User?> GetUserByEmailAsync(string email) => 
        await _usersCollection.Find(u => u.Email == email).FirstOrDefaultAsync();
}