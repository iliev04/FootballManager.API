using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FootballManager.API.Models
{
    public class Player
    {
        public int Id { get; set; }

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

        [Precision(18, 2)]
        public decimal MarketValue { get; set; }
        public bool IsStartingEleven { get; set; }

        [Range(1, 100)]
        public int AttackStat { get; set; }

        [Range(1, 100)]
        public int DefenseStat { get; set; }

        [Range(1, 100)]
        public int Stamina { get; set; }

        public int? ClubId { get; set; }

        [ForeignKey("ClubId")]
        public Club? Club { get; set; }
    }
}