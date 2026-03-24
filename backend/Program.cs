using StudentApp.Api.Data;
using StudentApp.Api.Services;
using StudentApp.Api.Hubs;
using StudentApp.Api.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// --- Services Registration ---

// SignalR (for chat)
builder.Services.AddSignalR();

// MongoDB Client (Singleton - best practice)
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var connectionString = builder.Configuration.GetSection("StudentDatabase")["ConnectionString"];
    if (string.IsNullOrEmpty(connectionString))
    {
        throw new InvalidOperationException("MongoDB ConnectionString is missing in configuration.");
    }
    return new MongoClient(connectionString);
});

// Core Services
builder.Services.AddSingleton<MongoService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<WellbeingService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// CORS Policy (Allow all for now - restrict in production)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", b => b
        .SetIsOriginAllowed(_ => true)
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()); // Needed for SignalR
});

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("JWT Key is missing in configuration.");
}
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"]
    };
});

// --------------------------------------------------------

var app = builder.Build();

// Global Exception Handling
app.UseMiddleware<ExceptionMiddleware>();

// Enable CORS
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SignalR Hub
app.MapHub<ChatHub>("/chatHub");

// Run application
app.Run("http://0.0.0.0:8080");