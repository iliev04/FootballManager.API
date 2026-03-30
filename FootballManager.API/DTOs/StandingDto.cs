namespace FootballManager.API.DTOs
{
    public class StandingDto
    {
        public int ClubId { get; set; }
        public string ClubName { get; set; } = string.Empty;
        public int MatchesPlayed { get; set; }
        public int Won { get; set; }
        public int Drawn { get; set; }
        public int Lost { get; set; }
        public int GoalsFor { get; set; }
        public int GoalsAgainst { get; set; }

        public int GoalDifference => GoalsFor - GoalsAgainst;
        public int Points => (Won * 3) + Drawn;
    }
}