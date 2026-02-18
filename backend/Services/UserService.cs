using StudentApp.Api.Models;

namespace StudentApp.Api.Services;

public class UserService
{
    public List<User> GetAllUsers()
    {
        return new List<User>
        {
            // Id එකට "1" වගේ string එකක් දෙන්න (මොකද අපේ Model එකේ Id එක string නිසා)
            // 'Name' වෙනුවට 'Username' පාවිච්චි කරන්න
            new User { Id = "1", Username = "Supun Anjana", Role = "Developer", Email = "supun@test.com" },
            new User { Id = "2", Username = "Kasun Perera", Role = "Designer", Email = "kasun@test.com" }
        };
    }
}