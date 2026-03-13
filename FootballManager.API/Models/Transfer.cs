using Microsoft.EntityFrameworkCore;

namespace FootballManager.API.Models
{
    public class Transfer
    {
        public int Id { get; set; }
        public int PlayerId { get; set; }
        public int FromClubId { get; set; }
        public int ToClubId { get; set; }

        [Precision(18, 2)]
        public decimal TransferFee { get; set; }
        public DateTime TransferDate { get; set; }
    }
}