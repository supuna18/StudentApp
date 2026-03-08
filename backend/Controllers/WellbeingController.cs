using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Models;
using StudentApp.Api.Services;

namespace StudentApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WellbeingController : ControllerBase
    {
        // මෙතන නම WellbeingService ලෙස වෙනස් කළා
        private readonly WellbeingService _wellbeingService;

        public WellbeingController(WellbeingService wellbeingService)
        {
            _wellbeingService = wellbeingService;
        }

        [HttpPost("limits")]
        public async Task<IActionResult> SetTimeLimit([FromBody] UserLimit newLimit)
        {
            try {
                // සැබෑ ලෙසම MongoDB එකට සේව් කිරීම සිදු වේ
                await _wellbeingService.CreateLimitAsync(newLimit);
                return Ok(new { message = "Saved to MongoDB Compass! 🚀", data = newLimit });
            }
            catch (Exception ex) {
                return BadRequest(new { message = "Error saving to Database", error = ex.Message });
            }
        }
    }
}