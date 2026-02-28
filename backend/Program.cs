using StudentApp.Api.Data;
using StudentApp.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MongoDB.Driver; // මෙය අලුතින් ඇතුළත් කළා

var builder = WebApplication.CreateBuilder(args);

// --- 1. සර්විස් රෙජිස්ටර් කරන කොටස (Build එකට කලින්) ---

// MongoDB සම්බන්ධතාවය IMongoClient හරහා රෙජිස්ටර් කිරීම (Member 2 ගේ Controller එක සඳහා)
builder.Services.AddSingleton<IMongoClient>(sp => 
{
    var connectionString = builder.Configuration.GetSection("StudentDatabase")["ConnectionString"];
    return new MongoClient(connectionString);
});

builder.Services.AddSingleton<MongoService>();
builder.Services.AddScoped<AuthService>();

builder.Services.AddControllers();

// CORS සැකසුම් (දැනටමත් තිබුණා, එය එලෙසම තබා ගත්තා)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Authentication සහ JWT සැකසුම් (ඔයාගේ code එක එලෙසම තබා ගත්තා)
var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"]!);
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

// --- 2. මිඩ්ල්වෙයාර් (Middleware) පයිප්ලයින් එක ---

// CORS සක්‍රීය කිරීම
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Docker ඇතුළේ දුවන්න මේ පේළිය
app.Run("http://0.0.0.0:8080");