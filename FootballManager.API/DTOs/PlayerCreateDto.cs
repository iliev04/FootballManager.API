using System.ComponentModel.DataAnnotations;

namespace FootballManager.API.DTOs
{
    public class PlayerCreateDto
    {
        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(3)]
        public string Position { get; set; } = string.Empty;

        [Range(1, 99)]
        public int SquadNumber { get; set; }

        public decimal MarketValue { get; set; }

        [Range(1, 100)]
        public int AttackStat { get; set; }

        [Range(1, 100)]
        public int DefenseStat { get; set; }

        [Range(1, 100)]
        public int Stamina { get; set; }

        public int? ClubId { get; set; }
    }
}