// VerifyOtpDto.cs
namespace Foodime_Backend.DTOs.Auth
{
    public class VerifyOtpDto
    {
        public string Email { get; set; }
        public string Otp { get; set; }
    }
}
