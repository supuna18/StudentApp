using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Services;

namespace StudentApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")] // මෙතනින් තමයි /api/users කියන පාර හැදෙන්නේ
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController()
    {
        _userService = new UserService(); // පස්සේ මේක Dependency Injection වලින් හදමු
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(_userService.GetAllUsers());
    }
}