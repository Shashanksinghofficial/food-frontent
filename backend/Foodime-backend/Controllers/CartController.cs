using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Foodime_Backend.Data;
using Foodime_Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Foodime_Backend.DTOs.Cart;   // ✅ FIXED USING

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

        // ✅ ADD TO CART
        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == dto.ProductId);

            if (existingItem != null)
            {
                existingItem.Quantity += dto.Quantity;
            }
            else
            {
                var cartItem = new CartItem
                {
                    UserId = userId,
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity
                };

                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Added to cart successfully" });
        }

        // ✅ UPDATE QUANTITY
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuantity(int id, [FromBody] UpdateCartDto dto)
        {
            if (dto == null || dto.Quantity < 1)
                return BadRequest("Invalid quantity");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // ✅ Secure version (only logged-in user can update their cart)
            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (cartItem == null)
                return NotFound();

            cartItem.Quantity = dto.Quantity;
            await _context.SaveChangesAsync();

            return Ok();
        }

        // ✅ DELETE ITEM
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (cartItem == null)
                return NotFound();

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}