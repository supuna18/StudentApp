using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Services;

namespace StudentApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try {
            return Ok(await _userService.GetAllUsers());
        } catch (Exception ex) {
            return BadRequest(new { message = "Error fetching users", error = ex.Message });
        }
    }
}