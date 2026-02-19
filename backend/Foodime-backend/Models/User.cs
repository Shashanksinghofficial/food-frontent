using System;

namespace Foodime_Backend.Models
{
    public class User
    {
        public int Id { get; set; }

        public required string FirstName { get; set; }
        public required string LastName { get; set; }

        public required string Username { get; set; }

        public required string Email { get; set; }

        public required string Phone { get; set; }

        public required string PasswordHash { get; set; }

        public required string Role { get; set; } // Customer, Vendor, DeliveryBoy, Admin
            
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // ================= FORGOT PASSWORD / RESET =================
        public string? ForgotPasswordOtp { get; set; }             // OTP code
        public DateTime? OtpGeneratedAt { get; set; }             // OTP generation time
        public string? PasswordResetToken { get; set; }           // Reset token
        public DateTime? PasswordResetTokenExpiry { get; set; }   // Token expiry
    }
}
