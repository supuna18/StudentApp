using StudentApp.Api.Models;
using MongoDB.Driver;

namespace StudentApp.Api.Services;

public class WellbeingService
{
    private readonly IMongoCollection<UserLimit> _userLimitsCollection;

    public WellbeingService(IMongoClient client, IConfiguration config)
    {
        var databaseName = config.GetSection("StudentDatabase")["DatabaseName"];
        var database = client.GetDatabase(databaseName);

        var collectionName = config.GetSection("StudentDatabase")["UserLimitsCollection"] ?? "UserLimits";
        _userLimitsCollection = database.GetCollection<UserLimit>(collectionName);
    }

    public async Task CreateLimitAsync(UserLimit newLimit) =>
        await _userLimitsCollection.InsertOneAsync(newLimit);
}