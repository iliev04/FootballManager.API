using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FootballManager.API.Data;
using FootballManager.API.Models;
using FootballManager.API.DTOs;

namespace FootballManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClubsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClubsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/clubs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClubDto>>> GetClubs()
        {
            var clubs = await _context.Clubs
                .Select(c => new ClubDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Budget = c.Budget
                })
                .ToListAsync();

            return Ok(clubs);
        }

        // GET: api/clubs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ClubDto>> GetClub(int id)
        {
            var club = await _context.Clubs.FindAsync(id);

            if (club == null)
            {
                return NotFound("Клубът не е намерен.");
            }

            var clubDto = new ClubDto
            {
                Id = club.Id,
                Name = club.Name,
                Budget = club.Budget
            };

            return Ok(clubDto);
        }

        // POST: api/clubs
        [HttpPost]
        public async Task<ActionResult<ClubDto>> CreateClub(ClubCreateDto clubDto)
        {
            var club = new Club
            {
                Name = clubDto.Name,
                Budget = clubDto.Budget
            };

            _context.Clubs.Add(club);
            await _context.SaveChangesAsync();

            var createdClubDto = new ClubDto
            {
                Id = club.Id,
                Name = club.Name,
                Budget = club.Budget
            };

            return CreatedAtAction(nameof(GetClub), new { id = club.Id }, createdClubDto);
        }
    }
}