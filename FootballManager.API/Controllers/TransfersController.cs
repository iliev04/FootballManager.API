using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FootballManager.API.Data;
using FootballManager.API.Models;
using FootballManager.API.DTOs;

namespace FootballManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransfersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransfersController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/transfers
        [HttpPost]
        public async Task<IActionResult> ExecuteTransfer(TransferCreateDto dto)
        {
            var player = await _context.Players.FindAsync(dto.PlayerId);
            if (player == null) return NotFound("Играчът не е намерен.");

            var buyerClub = await _context.Clubs.FindAsync(dto.ToClubId);
            if (buyerClub == null) return NotFound("Купуващият клуб не съществува.");

            if (player.ClubId == dto.ToClubId) return BadRequest("Играчът вече е част от този клуб.");

            if (buyerClub.Budget < dto.TransferFee) return BadRequest("Купуващият клуб няма достатъчно бюджет за този трансфер.");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                int? sellerClubId = player.ClubId;
                Club? sellerClub = null;

                if (sellerClubId.HasValue)
                {
                    sellerClub = await _context.Clubs.FindAsync(sellerClubId.Value);
                    if (sellerClub != null)
                    {
                        sellerClub.Budget += dto.TransferFee;
                    }
                }

                buyerClub.Budget -= dto.TransferFee;

                player.ClubId = dto.ToClubId;
                player.IsStartingEleven = false;

                var transferRecord = new Transfer
                {
                    PlayerId = player.Id,
                    FromClubId = sellerClubId ?? 0,
                    ToClubId = buyerClub.Id,
                    TransferFee = dto.TransferFee,
                    TransferDate = DateTime.UtcNow
                };
                _context.Transfers.Add(transferRecord);

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new
                {
                    Message = $"Трансферът на {player.FirstName} {player.LastName} в {buyerClub.Name} за {dto.TransferFee} беше успешен!"
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Възникна грешка при обработката на трансфера: " + ex.Message);
            }
        }
    }
}