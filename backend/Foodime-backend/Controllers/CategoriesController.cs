using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Foodime_Backend.Data;
using Foodime_Backend.Models;

namespace Foodime_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly FoodimeDbContext _context;

        public CategoriesController(FoodimeDbContext context)
        {
            _context = context;
        }

        // ✅ GET: api/Categories
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _context.Categories
                .Select(c => new
                {
                    c.Id,
                    c.Name
                })
                .ToListAsync();

            return Ok(categories);
        }
        // ✅ GET: api/Categories/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _context.Categories
                .Where(c => c.Id == id)
                .Select(c => new
                {
                    c.Id,
                    c.Name
                })
                .FirstOrDefaultAsync();

            if (category == null)
                return NotFound("Category not found");

            return Ok(category);
        }

        // ✅ POST: api/Categories
        [HttpPost]
        public async Task<IActionResult> AddCategory(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return Ok(category);
        }

        // ✅ PUT: api/Categories/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, Category updatedCategory)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
                return NotFound("Category not found");

            category.Name = updatedCategory.Name;

            await _context.SaveChangesAsync();

            return Ok(category);
        }

        // ✅ DELETE: api/Categories/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return NotFound("Category not found");

            // 🔥 Optional Safety Check
            if (category.Products != null && category.Products.Any())
                return BadRequest("Cannot delete category with existing products");

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok("Category deleted successfully");
        }
    }
}