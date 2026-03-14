using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FootballManager.API.Data;
using FootballManager.API.Models;
using FootballManager.API.DTOs;

namespace FootballManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlayersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PlayersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/players
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PlayerDto>>> GetPlayers()
        {
            var players = await _context.Players
                .Select(p => new PlayerDto
                {
                    Id = p.Id,
                    FirstName = p.FirstName,
                    LastName = p.LastName,
                    Position = p.Position,
                    SquadNumber = p.SquadNumber,
                    MarketValue = p.MarketValue,
                    IsStartingEleven = p.IsStartingEleven,
                    AttackStat = p.AttackStat,
                    DefenseStat = p.DefenseStat,
                    Stamina = p.Stamina,
                    ClubId = p.ClubId
                })
                .ToListAsync();

            return Ok(players);
        }

        // POST: api/players
        [HttpPost]
        public async Task<ActionResult<PlayerDto>> CreatePlayer(PlayerCreateDto dto)
        {
            if (dto.ClubId.HasValue)
            {
                var clubExists = await _context.Clubs.AnyAsync(c => c.Id == dto.ClubId);
                if (!clubExists)
                {
                    return BadRequest("Посоченият клуб не съществува.");
                }
            }

            var player = new Player
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Position = dto.Position,
                SquadNumber = dto.SquadNumber,
                MarketValue = dto.MarketValue,
                AttackStat = dto.AttackStat,
                DefenseStat = dto.DefenseStat,
                Stamina = dto.Stamina,
                ClubId = dto.ClubId,
                IsStartingEleven = false
            };

            _context.Players.Add(player);
            await _context.SaveChangesAsync();

            var playerDto = new PlayerDto
            {
                Id = player.Id,
                FirstName = player.FirstName,
                LastName = player.LastName,
                Position = player.Position,
                SquadNumber = player.SquadNumber,
                MarketValue = player.MarketValue,
                IsStartingEleven = player.IsStartingEleven,
                AttackStat = player.AttackStat,
                DefenseStat = player.DefenseStat,
                Stamina = player.Stamina,
                ClubId = player.ClubId
            };

            return CreatedAtAction(nameof(GetPlayers), new { id = player.Id }, playerDto);
        }

        // PUT: api/players/5/toggle-starter
        [HttpPut("{id}/toggle-starter")]
        public async Task<IActionResult> ToggleStarter(int id)
        {
            var player = await _context.Players.FindAsync(id);

            if (player == null)
            {
                return NotFound("Играчът не е намерен.");
            }

            if (player.ClubId == null)
            {
                return BadRequest("Този играч е свободен агент. Първо трябва да подпише с клуб, за да бъде титуляр.");
            }

            if (!player.IsStartingEleven)
            {
                var startersCount = await _context.Players
                    .CountAsync(p => p.ClubId == player.ClubId && p.IsStartingEleven);

                if (startersCount >= 11)
                {
                    return BadRequest("Клубът вече има 11 титуляри! Първо трябва да извадите някого от състава.");
                }
            }

            player.IsStartingEleven = !player.IsStartingEleven;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = $"Статусът на {player.FirstName} {player.LastName} е променен успешно.",
                IsStarter = player.IsStartingEleven
            });
        }
    }
}