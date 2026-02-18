using StudentApp.Api.Data;
using StudentApp.Api.Models;
using BCrypt.Net;

namespace StudentApp.Api.Services;

public class AuthService
{
    private readonly MongoService _mongoService;

    public AuthService(MongoService mongoService)
    {
        _mongoService = mongoService;
    }

    public async Task<string> RegisterAsync(User user, string password)
    {
        // 1. if available user through the e mail
        var existingUser = await _mongoService.GetUserByEmailAsync(user.Email);
        if (existingUser != null) return "User already exists";

        // 2. Hash the password 
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);

        // 3. Save in the database 
        await _mongoService.CreateUserAsync(user);

        return "Success";
    }
}