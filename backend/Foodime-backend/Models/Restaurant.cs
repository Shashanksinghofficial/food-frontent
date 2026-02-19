namespace Foodime_Backend.Models
{
    public class Restaurant
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Address { get; set; }
        public bool IsApproved { get; set; } = false;
    }
}
