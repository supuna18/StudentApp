using StudentApp.Api.Data;
using StudentApp.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- 1. සර්විස් රෙජිස්ටර් කරන කොටස (Build එකට කලින්) ---

builder.Services.AddSingleton<MongoService>();
builder.Services.AddScoped<AuthService>();

builder.Services.AddControllers();

// CORS සැකසුම්
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Authentication සහ JWT සැකසුම් (මෙතනයි වැරදිලා තිබ්බේ)
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

var app = builder.Build(); // මෙතනින් පස්සේ builder පාවිච්චි කරන්න බැහැ

// --- 2. මිඩ්ල්වෙයාර් (Middleware) පයිප්ලයින් එක ---

app.UseCors("AllowAll");

// මේ පේළි දෙක අනිවාර්යයෙන්ම තියෙන්න ඕනේ JWT වැඩ කරන්න
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Docker ඇතුළේ දුවන්න මේ පේළිය
app.Run("http://0.0.0.0:8080");