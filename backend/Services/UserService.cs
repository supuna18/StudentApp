using StudentApp.Api.Models;
using StudentApp.Api.Data;
using MongoDB.Driver;
using BCrypt.Net;

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

    public async Task<User?> GetUserById(string id)
    {
        return await _mongoService.GetUserByIdAsync(id);
    }

    public async Task<bool> UpdateUserProfile(string id, string username, string email)
    {
        var user = await _mongoService.GetUserByIdAsync(id);
        if (user == null) return false;

        user.Username = username;
        user.Email = email;

        return await _mongoService.UpdateUserAsync(id, user);
    }

    public async Task<bool> DeleteUser(string id)
    {
        return await _mongoService.DeleteUserAsync(id);
    }

    public async Task<bool> SetPasswordResetOtp(string userId, string otp)
    {
        var user = await _mongoService.GetUserByIdAsync(userId);
        if (user == null) return false;

        user.PasswordResetOTP = otp;
        user.OTPExpiry = DateTime.UtcNow.AddMinutes(10);

        return await _mongoService.UpdateUserAsync(userId, user);
    }

    public async Task<bool> VerifyOtpAndChangePassword(string userId, string otp, string newPassword)
    {
        var user = await _mongoService.GetUserByIdAsync(userId);
        if (user == null) return false;

        if (user.PasswordResetOTP == otp && user.OTPExpiry > DateTime.UtcNow)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.PasswordResetOTP = null;
            user.OTPExpiry = null;

            return await _mongoService.UpdateUserAsync(userId, user);
        }

        return false;
    }
}