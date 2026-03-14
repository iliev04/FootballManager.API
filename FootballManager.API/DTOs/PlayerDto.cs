namespace FootballManager.API.DTOs
{
    public class PlayerDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public int SquadNumber { get; set; }
        public decimal MarketValue { get; set; }
        public bool IsStartingEleven { get; set; }

        public int AttackStat { get; set; }
        public int DefenseStat { get; set; }
        public int Stamina { get; set; }

        public int? ClubId { get; set; }
    }
}