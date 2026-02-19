using System.ComponentModel.DataAnnotations;

namespace Foodime_Backend.DTOs.Auth
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Email or Username is required")]
        public string EmailOrUsername { get; set; } = null!;

        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; } = null!;
    }
}
