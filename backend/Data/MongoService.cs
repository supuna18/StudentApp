using MongoDB.Driver;
using StudentApp.Api.Models;

namespace StudentApp.Api.Data;

public class MongoService
{
    private readonly IMongoCollection<User> _usersCollection;
    private readonly IMongoCollection<StudyGroup> _studyGroupsCollection;
    private readonly IMongoCollection<StudySession> _studySessionsCollection;
    
    // --- ADDED: For WhatsApp style chat history ---
    private readonly IMongoCollection<ChatMessage> _chatMessagesCollection;

    public MongoService(IConfiguration config)
    {
        var client = new MongoClient(config.GetSection("StudentDatabase:ConnectionString").Value);
        var database = client.GetDatabase(config.GetSection("StudentDatabase:DatabaseName").Value);
        
        // 1. Initializing the Users collection (Leader's code)
        _usersCollection = database.GetCollection<User>(config.GetSection("StudentDatabase:CollectionName").Value);

        // 2. Initializing StudyGroups collection
        _studyGroupsCollection = database.GetCollection<StudyGroup>("StudyGroups");

        // 3. Initializing StudySessions collection (Scheduler)
        _studySessionsCollection = database.GetCollection<StudySession>("StudySessions");

        // --- 4. INITIALIZE ChatMessages collection ---
        _chatMessagesCollection = database.GetCollection<ChatMessage>("ChatMessages");
    }

    // Public properties for Controllers to access
    public IMongoCollection<User> Users => _usersCollection;
    public IMongoCollection<StudyGroup> StudyGroups => _studyGroupsCollection;
    public IMongoCollection<StudySession> StudySessions => _studySessionsCollection;
    
    // --- PROPERTY FOR CHAT HISTORY & SIGNALR ---
    public IMongoCollection<ChatMessage> ChatHistory => _chatMessagesCollection;

    // Existing helper methods
    public async Task CreateUserAsync(User newUser) => 
        await _usersCollection.InsertOneAsync(newUser);

    public async Task<User?> GetUserByEmailAsync(string email) => 
        await _usersCollection.Find(u => u.Email == email).FirstOrDefaultAsync();

    public async Task<List<User>> GetAllUsersAsync() =>
        await _usersCollection.Find(_ => true).ToListAsync();
}