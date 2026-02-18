using MongoDB.Driver;
using StudentApp.Api.Models;

namespace StudentApp.Api.Data;

public class MongoService
{
    private readonly IMongoCollection<User> _usersCollection;

    public MongoService(IConfiguration config)
    {
        var client = new MongoClient(config.GetSection("StudentDatabase:ConnectionString").Value);
        var database = client.GetDatabase(config.GetSection("StudentDatabase:DatabaseName").Value);
        _usersCollection = database.GetCollection<User>(config.GetSection("StudentDatabase:CollectionName").Value);
    }

    public async Task CreateUserAsync(User newUser) => //Insert a new user into the database
        await _usersCollection.InsertOneAsync(newUser);

    public async Task<User?> GetUserByEmailAsync(string email) => //According to the email, find the user in the database and return it
        await _usersCollection.Find(u => u.Email == email).FirstOrDefaultAsync();
}