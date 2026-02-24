using Microsoft.EntityFrameworkCore;
using Foodime_Backend.Models;

namespace Foodime_Backend.Data
{
    public class FoodimeDbContext : DbContext
    {
        public FoodimeDbContext(DbContextOptions<FoodimeDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Restaurant> Restaurants { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }

        public DbSet<CartItem> CartItems { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            base.OnModelCreating(modelBuilder);
        }
    }
}
