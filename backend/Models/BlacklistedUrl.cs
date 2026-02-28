namespace StudentApp.Api.Models
{
    public class BlacklistedUrl
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Domain { get; set; } = string.Empty; // e.g. "fake-news.com"
        public string RiskLevel { get; set; } = "High";
    }
}