using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Models;

[ApiController]
[Route("api/[controller]")]
public class GameController : ControllerBase
{
    [HttpPost("save-score")]
    public IActionResult SaveScore([FromBody] GameScore score)
    {
        // මෙතනදී database එකට score එක save කරන්න (Database code here)
        return Ok(new { message = "Score saved successfully!" });
    }
}