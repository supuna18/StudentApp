using System.Collections.Generic;

namespace StudentApp.Api.Models
{
    public class AdminWellbeingOverview
    {
        public int UsersTracked { get; set; }
        public int TotalLimitsSet { get; set; }
        public double AvgDailyMinutes { get; set; }
        public int ActiveStreaks { get; set; }
        public List<DomainUsageStat> TopDomains { get; set; } = new();
        public List<CategoryStat> CategoryDistribution { get; set; } = new();
    }

    public class DomainUsageStat
    {
        public string Domain { get; set; } = string.Empty;
        public double TotalMinutes { get; set; }
    }

    public class CategoryStat
    {
        public string Category { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class UserWellbeingSummary
    {
        public string UserId { get; set; } = string.Empty;
        public int LimitsCount { get; set; }
        public double AvgDailyMinutes { get; set; }
        public int Streak { get; set; }
        public int BadgesCount { get; set; }
        public List<string> Badges { get; set; } = new();
    }
}
