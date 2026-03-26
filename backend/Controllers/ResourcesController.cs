using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentApp.Api.Data;
using StudentApp.Api.Models;
using System.Security.Claims;

namespace StudentApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Allow all authenticated users by default
public class ResourcesController : ControllerBase
{
    private readonly MongoService _mongoService;
    private readonly IWebHostEnvironment _env;

    public ResourcesController(MongoService mongoService, IWebHostEnvironment env)
    {
        _mongoService = mongoService;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetResources()
    {
        // Admin sees all, Students might only see approved ones (depending on your logic)
        // For now, let's allow fetching based on role if needed, or just all.
        var resources = await _mongoService.GetAllResourcesAsync();
        return Ok(resources);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadResource([FromForm] ResourceUploadRequest request)
    {
        if (request.File == null || request.File.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        // Security & Validation: File types and sizes
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".docx" };
        var extension = Path.GetExtension(request.File.FileName).ToLower();
        
        if (!allowedExtensions.Contains(extension))
            return BadRequest(new { message = "Invalid file type. Allowed: .jpg, .jpeg, .png, .pdf, .docx" });

        if (request.File.Length > 10 * 1024 * 1024) // 10MB limit
            return BadRequest(new { message = "File size exceeds 10MB limit" });

        // Get User ID from JWT
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst("id")?.Value 
                    ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User identification failed" });

        try
        {
            var uploadsPath = Path.Combine(_env.ContentRootPath, "Uploads", "resources");
            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            var fileName = Guid.NewGuid().ToString() + extension;
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            var resource = new Resource
            {
                Title = request.Title,
                Category = request.Category,
                Description = request.Description,
                FileName = request.File.FileName,
                FileType = extension,
                FileSize = request.File.Length,
                FileUrl = $"/Uploads/resources/{fileName}",
                UserId = userId,
                IsApproved = false, // Always false by default for new uploads
                UploadedAt = DateTime.UtcNow
            };

            await _mongoService.CreateResourceAsync(resource);
            return Ok(resource);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during file upload", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")] // Only Admin can delete
    public async Task<IActionResult> DeleteResource(string id)
    {
        var resource = await _mongoService.GetResourceByIdAsync(id);
        if (resource == null) return NotFound(new { message = "Resource not found" });

        var filePath = Path.Combine(_env.ContentRootPath, resource.FileUrl.TrimStart('/'));
        if (System.IO.File.Exists(filePath))
            System.IO.File.Delete(filePath);

        var result = await _mongoService.DeleteResourceAsync(id);
        if (result) return Ok(new { message = "Resource deleted successfully" });
        return BadRequest(new { message = "Failed to delete resource" });
    }

    [HttpPatch("{id}")]
    [Authorize(Roles = "Admin")] // Only Admin can update/approve
    public async Task<IActionResult> UpdateResource(string id, [FromBody] ResourceUpdateRequest request)
    {
        var resource = await _mongoService.GetResourceByIdAsync(id);
        if (resource == null) return NotFound(new { message = "Resource not found" });

        resource.Title = request.Title ?? resource.Title;
        resource.Category = request.Category ?? resource.Category;
        resource.Description = request.Description ?? resource.Description;
        
        if (request.IsApproved.HasValue)
            resource.IsApproved = request.IsApproved.Value;

        var result = await _mongoService.UpdateResourceAsync(id, resource);
        if (result) return Ok(resource);
        return BadRequest(new { message = "Failed to update resource" });
    }
}

public class ResourceUploadRequest
{
    public string Title { get; set; } = "";
    public string Category { get; set; } = "";
    public string Description { get; set; } = "";
    public IFormFile? File { get; set; }
}

public class ResourceUpdateRequest
{
    public string? Title { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
    public bool? IsApproved { get; set; }
}