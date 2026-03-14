using System.ComponentModel.DataAnnotations;

namespace FootballManager.API.DTOs
{
    public class TransferCreateDto
    {
        [Required]
        public int PlayerId { get; set; }

        [Required]
        public int ToClubId { get; set; }

        [Range(0, 1000000000)]
        public decimal TransferFee { get; set; }
    }
}