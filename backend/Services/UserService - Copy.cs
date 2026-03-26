using StudentApp.Api.Models;
using StudentApp.Api.Data;
using MongoDB.Driver;

namespace StudentApp.Api.Services;

public class UserService
{
    private readonly MongoService _mongoService;

    public UserService(MongoService mongoService)
    {
        _mongoService = mongoService;
    }

    public async Task<List<User>> GetAllUsers()
    {
        return await _mongoService.Users.Find(_ => true).ToListAsync();
    }
}
