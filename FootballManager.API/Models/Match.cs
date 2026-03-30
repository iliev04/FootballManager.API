namespace FootballManager.API.Models
{
    public class Match
    {
        public int Id { get; set; }
        public int HomeClubId { get; set; }
        public int AwayClubId { get; set; }
        public int HomeScore { get; set; }
        public int AwayScore { get; set; }
        public DateTime MatchDate { get; set; }
        public bool IsPlayed { get; set; }
        public string? MatchReport { get; set; }
        public int Round { get; set; }
    }
}