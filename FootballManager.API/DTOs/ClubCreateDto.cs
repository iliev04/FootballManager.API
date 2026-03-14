using System.ComponentModel.DataAnnotations;

namespace FootballManager.API.DTOs
{
    public class ClubCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Range(0, 1000000000)]
        public decimal Budget { get; set; }
    }
}