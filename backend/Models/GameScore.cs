namespace StudentApp.Api.Models
{
    public class GameScore
    {
        public int Id { get; set; }
        public string StudentName { get; set; }
        public int Score { get; set; }
        public string GameName { get; set; }
        public DateTime PlayedAt { get; set; } = DateTime.Now;
    }
}