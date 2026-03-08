using StudentApp.Api.Data;
using StudentApp.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// --- සර්විස් රෙජිස්ටර් කිරීම ---

// MongoDB Client එක Register කිරීම (EduSyncCluster Atlas එකට සම්බන්ධ වේ)
builder.Services.AddSingleton<IMongoClient>(sp => 
{
    var connectionString = builder.Configuration.GetSection("StudentDatabase")["ConnectionString"];
    return new MongoClient(connectionString);
});

builder.Services.AddSingleton<MongoService>();
builder.Services.AddScoped<AuthService>();

builder.Services.AddSingleton<WellbeingService>(); 



builder.Services.AddControllers();

// CORS සැකසුම්: Browser Extension එකට API එකට කතා කිරීමට මෙයින් අවසර ලැබේ
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Authentication සහ JWT සැකසුම්
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

// CORS සක්‍රීය කිරීම (අනිවාර්යයි)
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Docker ඇතුළේ දුවන්න මේ පේළිය
app.Run("http://0.0.0.0:8080");

