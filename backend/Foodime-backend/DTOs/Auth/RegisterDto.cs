using System.ComponentModel.DataAnnotations;
using Foodime_Backend.Models;
namespace Foodime_Backend.DTOs.Auth
{
    public class RegisterDto
    {
        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = null!;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = null!;

        [Required]
        [Phone]
        [MaxLength(15)]
        public string Phone { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;

        [Required]
        public User.UserRole Role { get; set; }
    }
}
