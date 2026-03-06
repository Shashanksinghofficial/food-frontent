using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Foodime_Backend.Data;
using Foodime_Backend.Models;

namespace Foodime_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly FoodimeDbContext _context;

        public ProductsController(FoodimeDbContext context)
        {
            _context = context;
        }

        // ✅ GET: api/products?category=2
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? category)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsAvailable)
                .AsQueryable();

            // 🔹 Category Filter
            if (category.HasValue)
            {
                query = query.Where(p => p.CategoryId == category.Value);
            }

            var products = await query
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.ImageUrl,
                    p.CategoryId,
                    Category = p.Category!.Name
                })
                .ToListAsync();

            return Ok(products);
        }

        // ✅ POST: api/products
        [HttpPost]
        public async Task<IActionResult> AddProduct(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return Ok(product);
        }

        // ✅ PUT: api/products/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Product updatedProduct)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
                return NotFound("Product not found");

            product.Name = updatedProduct.Name;
            product.Price = updatedProduct.Price;
            product.ImageUrl = updatedProduct.ImageUrl;
            product.IsAvailable = updatedProduct.IsAvailable;
            product.CategoryId = updatedProduct.CategoryId;

            await _context.SaveChangesAsync();

            return Ok(product);
        }

        // ✅ DELETE: api/products/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
                return NotFound("Product not found");

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok("Product deleted successfully");
        }
    }
}