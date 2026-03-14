namespace FootballManager.API.DTOs
{
    public class ClubDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Budget { get; set; }
    }
}