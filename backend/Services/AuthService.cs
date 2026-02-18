using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using StudentApp.Api.Models;
using StudentApp.Api.Data;
using BCrypt.Net;

namespace StudentApp.Api.Services;

public class AuthService
{
    private readonly MongoService _mongoService;
    private readonly IConfiguration _config;

    public AuthService(MongoService mongoService, IConfiguration config)
    {
        _mongoService = mongoService;
        _config = config;
    }

    // 1. ලියාපදිංචි වීමේ කොටස (Register)
    public async Task<string> RegisterAsync(User user, string password)
    {
        var existingUser = await _mongoService.GetUserByEmailAsync(user.Email);
        if (existingUser != null) return "User already exists";

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
        await _mongoService.CreateUserAsync(user);

        return "Success";
    }

    // 2. ඇතුළු වීමේ කොටස (Login)
    public async Task<string?> LoginAsync(string email, string password)
    {
        var user = await _mongoService.GetUserByEmailAsync(email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return null;

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]!);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] {
                new Claim(ClaimTypes.NameIdentifier, user.Id!),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            // ටෝකන් එක දින 7ක් වලංගුයි
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"]
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}