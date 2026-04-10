using System.Net;
using System.Net.Mail;

namespace StudentApp.Api.Services;

public class EmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    // 1. Existing OTP Email Method
    public async Task SendOtpEmailAsync(string toEmail, string groupName, string otp)
    {
        var fromEmail = _config["EmailSettings:FromEmail"];
        var appPassword = _config["EmailSettings:AppPassword"];

        if (string.IsNullOrEmpty(fromEmail) || string.IsNullOrEmpty(appPassword))
        {
            throw new Exception("Email settings are missing in appsettings.json");
        }

        var client = new SmtpClient("smtp.gmail.com", 587)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(fromEmail, appPassword)
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(fromEmail),
            Subject = $"EduSync: Access Code for {groupName}",
            Body = $@"Hello! 

Your study group '{groupName}' has been created successfully. 

Your unique Access Code (OTP) is: {otp}

Please share this code only with students you want to invite to your group. 
They can join by entering this code in the Collaboration Hub.

Happy Learning,
EduSync Team",
            IsBodyHtml = false
        };

        mailMessage.To.Add(toEmail);
        await client.SendMailAsync(mailMessage);
    }

    // 2. Existing Password Reset Method
    public async Task SendPasswordResetOtpEmailAsync(string toEmail, string otp)
    {
        var fromEmail = _config["EmailSettings:FromEmail"];
        var appPassword = _config["EmailSettings:AppPassword"];

        if (string.IsNullOrEmpty(fromEmail) || string.IsNullOrEmpty(appPassword))
        {
            throw new Exception("Email settings are missing in appsettings.json");
        }

        var client = new SmtpClient("smtp.gmail.com", 587)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(fromEmail, appPassword)
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(fromEmail),
            Subject = "EduSync: Password Reset OTP",
            Body = $@"Hello! 

You requested to change your password on EduSync. 

Your One-Time Password (OTP) for password reset is: {otp}

This OTP is valid for 10 minutes. If you did not request this change, please ignore this email and ensure your account is secure.

Happy Learning,
EduSync Team",
            IsBodyHtml = false
        };

        mailMessage.To.Add(toEmail);
        await client.SendMailAsync(mailMessage);
    }

    // ════════════ 3. NEW: Study Session Reminder Method ════════════
    // Time thandi ponaal indha mail anuppapadum
    public async Task SendStudyReminderEmailAsync(string toEmail, string topic)
    {
        var fromEmail = _config["EmailSettings:FromEmail"];
        var appPassword = _config["EmailSettings:AppPassword"];

        if (string.IsNullOrEmpty(fromEmail) || string.IsNullOrEmpty(appPassword))
        {
            throw new Exception("Email settings are missing in appsettings.json");
        }

        var client = new SmtpClient("smtp.gmail.com", 587)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(fromEmail, appPassword)
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(fromEmail),
            Subject = "⚠️ Missed Study Session Reminder!",
            Body = $@"Hello! 

This is a reminder from EduSync. 

You scheduled a focused study session for '{topic}', but the time has already passed and you haven't started yet. 

Procrastination is the thief of time! Please start your focus session now to stay on track with your goals.

Happy Learning,
EduSync Team",
            IsBodyHtml = false
        };

        mailMessage.To.Add(toEmail);
        await client.SendMailAsync(mailMessage);
    }
}