public class Product
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public required string ImageUrl { get; set; }
    public bool IsAvailable { get; set; }

    // 🔥 Relation
    public int CategoryId { get; set; }
    public Category? Category { get; set; } = null!;
}