using MongoDB.Driver;
using StudentApp.Api.Models;
using StudentApp.Api.Data;
using StudentApp.Api.Services;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace StudentApp.Api.Services;

public class SessionMonitor : BackgroundService 
{
    private readonly IServiceProvider _serviceProvider;
    private readonly PeriodicTimer _timer = new(TimeSpan.FromMinutes(1));

    public SessionMonitor(IServiceProvider serviceProvider) 
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) 
    {
        // Background-la 1 minute-ku oru thadava check pannum
        while (await _timer.WaitForNextTickAsync(stoppingToken) && !stoppingToken.IsCancellationRequested) 
        {
            using var scope = _serviceProvider.CreateScope();
            var mongoService = scope.ServiceProvider.GetRequiredService<MongoService>();
            var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

            var now = DateTime.Now;
            var todayStr = now.ToString("yyyy-MM-dd");
            var currentTimeStr = now.ToString("HH:mm");

            try 
            {
                // 1. Modhalla innaiku ulla sessions-ah mattum fetch panrom (Database side)
                var filter = Builders<StudySession>.Filter.And(
                    Builders<StudySession>.Filter.Eq(s => s.FromDate, todayStr),
                    Builders<StudySession>.Filter.Eq(s => s.IsReminderSent, false),
                    Builders<StudySession>.Filter.Eq(s => s.IsCompleted, false)
                );

                var allTodaySessions = await mongoService.StudySessions.Find(filter).ToListAsync();

                // 2. Fetch panna sessions-la, time thandi pona sessions-ah filter panrom (C# side - Safe)
                var missedSessions = allTodaySessions
                    .Where(s => string.Compare(s.StartTime, currentTimeStr) < 0)
                    .ToList();

                foreach (var session in missedSessions) 
                {
                    try 
                    {
                        // Email anupurathu
                        await emailService.SendStudyReminderEmailAsync(session.UserEmail, session.Title);
                        
                        // Database-la 'Reminded' nu update panna thaan thirumba thirumba mail pogaathu
                        var update = Builders<StudySession>.Update.Set(s => s.IsReminderSent, true);
                        await mongoService.StudySessions.UpdateOneAsync(s => s.Id == session.Id, update);
                        
                        Console.WriteLine($"[MONITOR] Reminder successfully sent to: {session.UserEmail}");
                    }
                    catch (Exception emailEx)
                    {
                        Console.WriteLine($"[MONITOR EMAIL ERROR]: Could not send to {session.UserEmail}. Error: {emailEx.Message}");
                    }
                }
            } 
            catch (Exception ex) 
            {
                Console.WriteLine("[MONITOR SYSTEM ERROR]: " + ex.Message);
            }
        }
    }
}