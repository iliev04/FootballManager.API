using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FootballManager.API.Data;
using FootballManager.API.Models;
using FootballManager.API.DTOs;

namespace FootballManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SeasonController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SeasonController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("standings")]
        public async Task<ActionResult<IEnumerable<StandingDto>>> GetStandings()
        {
            var clubs = await _context.Clubs.ToListAsync();
            var playedMatches = await _context.Matches.Where(m => m.IsPlayed).ToListAsync();

            var standings = new List<StandingDto>();

            foreach (var club in clubs)
            {
                var clubMatches = playedMatches.Where(m => m.HomeClubId == club.Id || m.AwayClubId == club.Id).ToList();

                var standing = new StandingDto { ClubId = club.Id, ClubName = club.Name };

                foreach (var match in clubMatches)
                {
                    standing.MatchesPlayed++;
                    bool isHome = match.HomeClubId == club.Id;
                    int goalsFor = isHome ? match.HomeScore : match.AwayScore;
                    int goalsAgainst = isHome ? match.AwayScore : match.HomeScore;

                    standing.GoalsFor += goalsFor;
                    standing.GoalsAgainst += goalsAgainst;

                    if (goalsFor > goalsAgainst) standing.Won++;
                    else if (goalsFor == goalsAgainst) standing.Drawn++;
                    else standing.Lost++;
                }
                standings.Add(standing);
            }

            var sortedStandings = standings
                .OrderByDescending(s => s.Points)
                .ThenByDescending(s => s.GoalDifference)
                .ThenByDescending(s => s.GoalsFor)
                .ToList();

            return Ok(sortedStandings);
        }

        [HttpPost("generate-schedule")]
        public async Task<IActionResult> GenerateSchedule()
        {
            _context.Matches.RemoveRange(_context.Matches);
            await _context.SaveChangesAsync();

            var clubs = await _context.Clubs.Select(c => c.Id).ToListAsync();
            if (clubs.Count < 2) return BadRequest("Няма достатъчно отбори за генериране на програма.");
            if (clubs.Count % 2 != 0) clubs.Add(-1);

            int numDays = clubs.Count - 1;
            int halfSize = clubs.Count / 2;
            List<Match> schedule = new List<Match>();
            DateTime seasonStart = DateTime.UtcNow.AddDays(7);

            for (int round = 0; round < numDays; round++)
            {
                for (int i = 0; i < halfSize; i++)
                {
                    int home = clubs[i];
                    int away = clubs[clubs.Count - 1 - i];

                    if (home != -1 && away != -1)
                    {
                        schedule.Add(new Match
                        {
                            HomeClubId = home,
                            AwayClubId = away,
                            Round = round + 1,
                            MatchDate = seasonStart.AddDays(round * 7),
                            IsPlayed = false
                        });
                    }
                }
                clubs.Insert(1, clubs.Last());
                clubs.RemoveAt(clubs.Count - 1);
            }

            _context.Matches.AddRange(schedule);
            await _context.SaveChangesAsync();

            return Ok(new { Message = $"Програмата за {numDays} кръга е генерирана успешно!", MatchesCreated = schedule.Count });
        }
    }
}