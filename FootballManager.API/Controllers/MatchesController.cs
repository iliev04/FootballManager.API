using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FootballManager.API.Data;
using FootballManager.API.Models;
using FootballManager.API.DTOs;
using System.Text;

namespace FootballManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MatchesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MatchesController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/matches/simulate
        [HttpPost("simulate")]
        public async Task<IActionResult> SimulateMatch(MatchSimulateDto dto)
        {
            if (dto.HomeClubId == dto.AwayClubId)
                return BadRequest("Един отбор не може да играе срещу себе си!");

            var homeClub = await _context.Clubs.Include(c => c.Players).FirstOrDefaultAsync(c => c.Id == dto.HomeClubId);
            var awayClub = await _context.Clubs.Include(c => c.Players).FirstOrDefaultAsync(c => c.Id == dto.AwayClubId);

            if (homeClub == null || awayClub == null)
                return NotFound("Един или и двата отбора не са намерени.");

            var homeStarters = homeClub.Players.Where(p => p.IsStartingEleven).ToList();
            var awayStarters = awayClub.Players.Where(p => p.IsStartingEleven).ToList();

            /*if (homeStarters.Count != 11 || awayStarters.Count != 11)
            {
                return BadRequest($"Мачът не може да започне! Домакините имат {homeStarters.Count} титуляри, а гостите {awayStarters.Count}. Трябват точно по 11.");
            }*/

            double homeAttackPower = homeStarters.Sum(p => p.AttackStat * (p.Stamina / 100.0)) * 1.10;
            double homeDefensePower = homeStarters.Sum(p => p.DefenseStat * (p.Stamina / 100.0));

            double awayAttackPower = awayStarters.Sum(p => p.AttackStat * (p.Stamina / 100.0));
            double awayDefensePower = awayStarters.Sum(p => p.DefenseStat * (p.Stamina / 100.0));

            Random rng = new Random();

            int homeGoals = CalculateGoals(homeAttackPower, awayDefensePower, rng);
            int awayGoals = CalculateGoals(awayAttackPower, homeDefensePower, rng);

            StringBuilder report = new StringBuilder();
            report.AppendLine($"КРАЕН РЕЗУЛТАТ: {homeClub.Name} {homeGoals} - {awayGoals} {awayClub.Name}");
            report.AppendLine("Събития от мача:");

            GenerateGoalEvents(homeGoals, homeClub.Name, homeStarters, rng, report);
            GenerateGoalEvents(awayGoals, awayClub.Name, awayStarters, rng, report);

            DecreaseStamina(homeStarters, rng);
            DecreaseStamina(awayStarters, rng);

            var match = new Match
            {
                HomeClubId = homeClub.Id,
                AwayClubId = awayClub.Id,
                HomeScore = homeGoals,
                AwayScore = awayGoals,
                MatchDate = DateTime.UtcNow,
                IsPlayed = true,
                MatchReport = report.ToString()
            };

            _context.Matches.Add(match);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                MatchId = match.Id,
                Result = $"{homeClub.Name} {homeGoals} - {awayGoals} {awayClub.Name}",
                Report = match.MatchReport
            });
        }

        private int CalculateGoals(double attack, double defense, Random rng)
        {
            double ratio = attack / (defense == 0 ? 1 : defense);
            double expectedGoals = ratio * 1.5;

            int actualGoals = rng.Next(0, (int)Math.Round(expectedGoals) + 3);

            if (actualGoals > 5 && rng.NextDouble() > 0.1) actualGoals = rng.Next(2, 5);

            return actualGoals;
        }
        private void GenerateGoalEvents(int goals, string clubName, List<Player> starters, Random rng, StringBuilder report)
        {
            var attackers = starters.Where(p => p.Position == "ATT" || p.Position == "MID").ToList();
            if (!attackers.Any()) attackers = starters;

            for (int i = 0; i < goals; i++)
            {
                int minute = rng.Next(1, 94);
                var scorer = attackers[rng.Next(attackers.Count)];
                report.AppendLine($"- {minute}' ГОЛ за {clubName}! Майсторско изпълнение на {scorer.FirstName} {scorer.LastName}.");
            }
        }

        private void DecreaseStamina(List<Player> starters, Random rng)
        {
            foreach (var player in starters)
            {
                player.Stamina -= rng.Next(5, 16);
                if (player.Stamina < 10) player.Stamina = 10;
            }
        }
    }
}