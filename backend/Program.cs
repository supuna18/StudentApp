var builder = WebApplication.CreateBuilder(args);

// 1. Controllers පාවිච්චි කරනවා කියලා කියන්න
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS හදන්න (Frontend එකට කතා කරන්න ඉඩ දෙන්න)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthorization();

// 2. Controllers ටික Map කරන්න
app.MapControllers();

app.Run();