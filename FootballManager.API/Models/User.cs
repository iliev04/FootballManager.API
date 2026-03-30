using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FootballManager.API.Models
{
    public class User
    {
        public int Id { get; set; }
        [Required, MaxLength(50)] public string Username { get; set; } = string.Empty;
        [Required, EmailAddress] public string Email { get; set; } = string.Empty;
        [Required] public string PasswordHash { get; set; } = string.Empty;
        [Required] public string Role { get; set; } = "Coach";
        public int? ClubId { get; set; }
        [ForeignKey("ClubId")]
        public Club? Club { get; set; }
    }
}