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
    }
}
