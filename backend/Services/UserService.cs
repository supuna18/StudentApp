using StudentApp.Api.Models;

namespace StudentApp.Api.Services;

public class UserService
{
    public List<User> GetAllUsers()
    {
        return new List<User> {
            new User { Id = 1, Name = "Supun Anjana", Role = "Developer" },
            new User { Id = 2, Name = "Kasun Perera", Role = "Designer" }
        };
    }
}