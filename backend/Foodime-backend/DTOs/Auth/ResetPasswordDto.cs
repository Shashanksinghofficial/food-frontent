namespace Foodime_Backend.DTOs.Auth
{
    public class ResetPasswordDto
    {
        public string? Email { get; set; }          // Nullable, kyunki backend validation karega
        public string? Otp { get; set; }            // Nullable OTP
        public string? ResetToken { get; set; }     // Nullable token
        public string? NewPassword { get; set; }    // Nullable, backend check karega
        public string? ConfirmPassword { get; set; } // Nullable, backend check karega
    }
}
