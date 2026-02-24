// VerifyOtpDto.cs
namespace Foodime_Backend.DTOs.Auth
{
    public class VerifyOtpDto
    {
        public required string Email { get; set; }
        public required string Otp { get; set; }
    }
}
