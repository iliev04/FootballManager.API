using System.ComponentModel.DataAnnotations;
using System.Numerics;
using Microsoft.EntityFrameworkCore;

namespace FootballManager.API.Models
{
    public class Club
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Precision(18, 2)]
        public decimal Budget { get; set; }

        public List<Player> Players { get; set; } = new List<Player>();
    }
}