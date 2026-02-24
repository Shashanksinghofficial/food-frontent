using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Foodime_Backend.Data;
using Foodime_Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Foodime_Backend.Controllers
{
    [Route("api/cart")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly FoodimeDbContext _context;

        public CartController(FoodimeDbContext context)
        {
            _context = context;
        }

        // ✅ GET CART
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var cartItems = await _context.CartItems
                .Include(c => c.Product)
                .Where(c => c.UserId == userId)
                .ToListAsync();

            var result = cartItems.Select(c => new
            {
                id = c.Id,
                name = c.Product!.Name,
                price = c.Product!.Price,
                quantity = c.Quantity,
                image = c.Product!.ImageUrl
            });

            return Ok(result);
        }

        // ✅ UPDATE QUANTITY
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuantity(int id, [FromBody] int quantity)
        {
            var cartItem = await _context.CartItems.FindAsync(id);
            if (cartItem == null)
                return NotFound();

            cartItem.Quantity = quantity;
            await _context.SaveChangesAsync();

            return Ok();
        }

        // ✅ DELETE ITEM
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var cartItem = await _context.CartItems.FindAsync(id);
            if (cartItem == null)
                return NotFound();

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}