using StudentApp.Api.Data;
using StudentApp.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. අපේ සර්විස් දෙක විතරක් Register කරමු
builder.Services.AddSingleton<MongoService>();
builder.Services.AddScoped<AuthService>();

builder.Services.AddControllers();

// 2. Frontend එකට කතා කරන්න CORS හදමු
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// 3. කිසිම Swagger එකක් මෙතන නැහැ!
app.UseCors("AllowAll");
app.MapControllers();

// 4. Docker ඇතුළේ දුවන්න මේ පේළිය අනිවාර්යයි
app.Run("http://0.0.0.0:8080");