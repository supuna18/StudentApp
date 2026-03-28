using StudentApp.Api.Models;
using MongoDB.Driver;
using MongoDB.Bson;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;
using StudentApp.Api.Data;
using System.Linq;
using System;

namespace StudentApp.Api.Services
{
    public class WellbeingService 
    {
        private readonly IMongoCollection<UserLimit> _userLimitsCollection;
        private readonly IMongoCollection<DailyUsage> _dailyUsageCollection;
        private readonly IMongoCollection<WellbeingProfile> _wellbeingProfileCollection;
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMongoDatabase _database;
        private readonly string _usersCollectionName;

        public WellbeingService(IMongoClient client, IConfiguration config)
        {
            var databaseName = config.GetSection("StudentDatabase")["DatabaseName"] ?? "EduSyncDB";
            _database = client.GetDatabase(databaseName);
            
            var limitsCollectionName = config.GetSection("StudentDatabase")["UserLimitsCollection"] ?? "UserLimits";
            _usersCollectionName = config.GetSection("StudentDatabase")["CollectionName"] ?? "Users";

            _userLimitsCollection = _database.GetCollection<UserLimit>(limitsCollectionName);
            _dailyUsageCollection = _database.GetCollection<DailyUsage>("DailyUsage");
            _wellbeingProfileCollection = _database.GetCollection<WellbeingProfile>("WellbeingProfiles");
            _usersCollection = _database.GetCollection<User>(_usersCollectionName);
        }

        // ─── Helpers ────────────────────────────────────────────────
        private static string BsonGetStr(BsonDocument doc, string camelKey, string pascalKey = null)
        {
            if (doc == null) return null;
            if (doc.Contains(camelKey) && doc[camelKey].BsonType == BsonType.String) return doc[camelKey].AsString;
            if (pascalKey != null && doc.Contains(pascalKey) && doc[pascalKey].BsonType == BsonType.String) return doc[pascalKey].AsString;
            return null;
        }

        private static string BsonGetUserId(BsonDocument doc)
        {
            return BsonGetStr(doc, "userId", "UserId") ?? "";
        }

        private static double BsonGetDouble(BsonDocument doc, string camelKey, string pascalKey = null)
        {
            if (doc == null) return 0;
            if (doc.Contains(camelKey) && doc[camelKey].IsNumeric) return doc[camelKey].ToDouble();
            if (pascalKey != null && doc.Contains(pascalKey) && doc[pascalKey].IsNumeric) return doc[pascalKey].ToDouble();
            return 0;
        }

        private static int BsonGetInt(BsonDocument doc, string camelKey, string pascalKey = null)
        {
            if (doc == null) return 0;
            if (doc.Contains(camelKey) && doc[camelKey].IsNumeric) return doc[camelKey].ToInt32();
            if (pascalKey != null && doc.Contains(pascalKey) && doc[pascalKey].IsNumeric) return doc[pascalKey].ToInt32();
            return 0;
        }

        private static List<string> BsonGetStringArray(BsonDocument doc, string camelKey, string pascalKey = null)
        {
            BsonArray arr = null;
            if (doc != null && doc.Contains(camelKey) && doc[camelKey].IsBsonArray) arr = doc[camelKey].AsBsonArray;
            else if (doc != null && pascalKey != null && doc.Contains(pascalKey) && doc[pascalKey].IsBsonArray) arr = doc[pascalKey].AsBsonArray;
            if (arr == null) return new List<string>();
            return arr.Select(b => b.ToString()).Where(s => s != null).ToList();
        }

        // ─── Core Endpoints ─────────────────────────────────────────

        public async Task UpsertLimitAsync(UserLimit limit)
        {
            var filter = Builders<UserLimit>.Filter.Eq(x => x.UserId, limit.UserId) & 
                         Builders<UserLimit>.Filter.Eq(x => x.Domain, limit.Domain);
            
            var update = Builders<UserLimit>.Update
                .Set("limitMinutes", limit.LimitMinutes)
                .Set("category", limit.Category);

            await _userLimitsCollection.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true });
        }

        public async Task DeleteLimitAsync(string id)
        {
            var rawCollection = _database.GetCollection<BsonDocument>("UserLimits");
            var filter = Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(id));
            await rawCollection.DeleteOneAsync(filter);
        }

        public async Task<List<UserLimit>> GetLimitsByUserAsync(string userId)
        {
            var rawCollection = _database.GetCollection<BsonDocument>("UserLimits");
            var filter = Builders<BsonDocument>.Filter.Eq("userId", userId);
            var rawDocs = await rawCollection.Find(filter).ToListAsync();

            return rawDocs.Select(doc => new UserLimit
            {
                Id = doc.Contains("_id") ? doc["_id"].ToString() : null,
                UserId = doc.Contains("userId") ? doc["userId"].AsString : "",
                Domain = doc.Contains("domain") ? doc["domain"].AsString : "",
                LimitMinutes = doc.Contains("limitMinutes") ? doc["limitMinutes"].ToInt32() : 60,
                Category = doc.Contains("category") ? doc["category"].AsString : "Other"
            }).ToList();
        }

        public async Task UpdateUsageAsync(DailyUsage usage)
        {
            var filter = Builders<DailyUsage>.Filter.Eq(u => u.UserId, usage.UserId) & 
                         Builders<DailyUsage>.Filter.Eq(u => u.Domain, usage.Domain) &
                         Builders<DailyUsage>.Filter.Eq(u => u.Date, usage.Date);

            var update = Builders<DailyUsage>.Update.Set(u => u.MinutesSpent, usage.MinutesSpent);
            
            await _dailyUsageCollection.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true });
        }

        public async Task<List<DailyUsage>> GetUsageByUserAsync(string userId) =>
            await _dailyUsageCollection.Find(u => u.UserId == userId).ToListAsync();

        public async Task<WellbeingProfile?> GetProfileAsync(string userId)
        {
            return await _wellbeingProfileCollection.Find(u => u.UserId == userId).FirstOrDefaultAsync();
        }

        public async Task SyncProfileAsync(string userId, int streak, List<string> badges)
        {
            var filter = Builders<WellbeingProfile>.Filter.Eq(u => u.UserId, userId);
            var update = Builders<WellbeingProfile>.Update
                .Set(u => u.FocusStreak, streak)
                .Set(u => u.UnlockedBadges, badges)
                .Set(u => u.LastFocusDate, DateTime.UtcNow);

            await _wellbeingProfileCollection.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true });
        }

        // ─── Admin Endpoints ─────────────────────────────────────────

        public async Task<AdminWellbeingOverview> GetAdminOverviewAsync()
        {
            try
            {
                var allUsage = await _database.GetCollection<BsonDocument>("DailyUsage").Find(_ => true).ToListAsync();
                var allLimits = await _database.GetCollection<BsonDocument>("UserLimits").Find(_ => true).ToListAsync();
                var allProfiles = await _database.GetCollection<BsonDocument>("WellbeingProfiles").Find(_ => true).ToListAsync();

                var usersTracked = allUsage.Select(u => BsonGetUserId(u)).Where(id => !string.IsNullOrEmpty(id)).Distinct().Count();
                var totalLimits = allLimits.Count;
                var avgDailyMinutes = allUsage.Any() ? Math.Round(allUsage.Average(u => BsonGetDouble(u, "minutesSpent", "MinutesSpent")), 1) : 0;
                var activeStreaks = allProfiles.Count(p => BsonGetInt(p, "focusStreak", "FocusStreak") > 0);

                var topDomains = allUsage
                    .GroupBy(u => BsonGetStr(u, "domain", "Domain") ?? "unknown")
                    .Select(g => new DomainUsageStat { 
                        Domain = g.Key, 
                        TotalMinutes = Math.Round(g.Sum(u => BsonGetDouble(u, "minutesSpent", "MinutesSpent")), 1)
                    })
                    .OrderByDescending(d => d.TotalMinutes)
                    .Take(10)
                    .ToList();

                var categoryDist = allLimits
                    .GroupBy(l => BsonGetStr(l, "category", "Category") ?? "Other")
                    .Select(g => new CategoryStat { Category = g.Key, Count = g.Count() })
                    .ToList();

                return new AdminWellbeingOverview
                {
                    UsersTracked = usersTracked,
                    TotalLimitsSet = totalLimits,
                    AvgDailyMinutes = avgDailyMinutes,
                    ActiveStreaks = activeStreaks,
                    TopDomains = topDomains,
                    CategoryDistribution = categoryDist
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CRITICAL] Wellbeing Overview Failure: {ex.Message}");
                throw;
            }
        }

        public async Task<List<UserWellbeingSummary>> GetAdminUserSummariesAsync()
        {
            try
            {
                var allUsage = await _database.GetCollection<BsonDocument>("DailyUsage").Find(_ => true).ToListAsync();
                var allLimits = await _database.GetCollection<BsonDocument>("UserLimits").Find(_ => true).ToListAsync();
                var allProfiles = await _database.GetCollection<BsonDocument>("WellbeingProfiles").Find(_ => true).ToListAsync();
                var usersRaw = await _database.GetCollection<BsonDocument>(_usersCollectionName).Find(_ => true).ToListAsync();

                var allUserIds = allUsage.Select(u => BsonGetUserId(u))
                    .Union(allLimits.Select(l => BsonGetUserId(l)))
                    .Union(allProfiles.Select(p => BsonGetUserId(p)))
                    .Where(id => !string.IsNullOrEmpty(id))
                    .Distinct()
                    .ToList();

                var summaries = new List<UserWellbeingSummary>();
                foreach (var userId in allUserIds)
                {
                    var userUsage = allUsage.Where(u => BsonGetUserId(u) == userId).ToList();
                    var userLimits = allLimits.Where(l => BsonGetUserId(l) == userId).ToList();
                    var profile = allProfiles.FirstOrDefault(p => BsonGetUserId(p) == userId);
                    var userDoc = usersRaw.FirstOrDefault(d => d.Contains("_id") && d["_id"].ToString() == userId);

                    summaries.Add(new UserWellbeingSummary
                    {
                        UserId = userId,
                        Username = BsonGetStr(userDoc, "username", "Username") ?? "Unknown Student",
                        Email = BsonGetStr(userDoc, "email", "Email") ?? "No Email",
                        LimitsCount = userLimits.Count,
                        AvgDailyMinutes = userUsage.Any() ? Math.Round(userUsage.Average(u => BsonGetDouble(u, "minutesSpent", "MinutesSpent")), 1) : 0,
                        Streak = BsonGetInt(profile, "focusStreak", "FocusStreak"),
                        BadgesCount = BsonGetStringArray(profile, "unlockedBadges", "UnlockedBadges").Count,
                        Badges = BsonGetStringArray(profile, "unlockedBadges", "UnlockedBadges")
                    });
                }

                return summaries.OrderByDescending(u => u.Streak).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CRITICAL] Wellbeing Summary Table Failure: {ex.Message}");
                throw;
            }
        }
    }
}
