using System.ComponentModel.DataAnnotations;

namespace FootballManager.API.DTOs
{
    public class MatchSimulateDto
    {
        [Required]
        public int HomeClubId { get; set; }

        [Required]
        public int AwayClubId { get; set; }
    }
}