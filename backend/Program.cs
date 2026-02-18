using StudentApp.Api.Data;
using StudentApp.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Register the database service (MongoDB) as a singleton (one instance for the whole app)
builder.Services.AddSingleton<MongoService>();

// 2. register the authentication service as scoped (a new instance for each request)
builder.Services.AddScoped<AuthService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS හදන්න (Frontend එකට කතා කරන්න ඉඩ දෙන්න)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// Swagger පේන්න හදන්නේ මෙතනින්

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAll");
app.UseAuthorization();

// Map the controllers to the endpoints
app.MapControllers();

app.Run();