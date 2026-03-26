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

    public async Task SendOtpEmailAsync(string toEmail, string groupName, string otp)
    {
        // IMPORTANT: Inga unga Gmail and App Password kudukkanum
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
}