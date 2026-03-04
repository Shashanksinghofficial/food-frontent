using Foodime_Backend.Data;
using Foodime_Backend.DTOs.Auth;
using Foodime_Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using AppUser = Foodime_Backend.Models.User;

namespace Foodime_Backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly FoodimeDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(FoodimeDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // ================= REGISTER =================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            if (dto.Role == AppUser.UserRole.Admin)
            {
                return BadRequest("Admin role cannot be assigned.");
            }
            var username = dto.Username.Trim();
            var email = dto.Email.Trim().ToLower();
            var phone = dto.Phone.Trim();

            if (await _context.Users.AnyAsync(u => u.Username == username))
            {
                string suggestion;
                do
                {
                    suggestion = username + "_" + Guid.NewGuid().ToString("N").Substring(0, 4);
                } while (await _context.Users.AnyAsync(u => u.Username == suggestion));

                return BadRequest(new { message = "Username already exists", suggestion });
            }

            if (await _context.Users.AnyAsync(u => u.Email == email))
                return BadRequest(new { message = "Email already exists" });

            if (await _context.Users.AnyAsync(u => u.Phone == phone))
                return BadRequest(new { message = "Phone already exists" });


            var user = new User
            {
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                Username = username,
                Email = email,
                Phone = phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "User registered successfully" });
        }

        // ================= LOGIN =================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email == dto.EmailOrUsername ||
                    u.Username == dto.EmailOrUsername);

            if (user == null)
                return Unauthorized(new { success = false, message = "User not found" });

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { success = false, message = "Invalid password" });

            var claims = new[]
{
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new Claim(ClaimTypes.Name, user.Username),
    new Claim(ClaimTypes.Role, user.Role.ToString())
};
            var jwtKey = _configuration.GetValue<string>("Jwt:Key")
              ?? throw new InvalidOperationException("JWT Key not configured");

            var issuer = _configuration.GetValue<string>("Jwt:Issuer")
                         ?? throw new InvalidOperationException("JWT Issuer not configured");

            var audience = _configuration.GetValue<string>("Jwt:Audience")
                         ?? throw new InvalidOperationException("JWT Audience not configured");

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new { success = true, message = "Login successful", token = tokenString });
        }

        // ================= FORGOT PASSWORD =================
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.Trim().ToLower());
            if (user == null)
                return BadRequest(new { message = "Email not registered" });

            // Generate OTP
            var otp = new Random().Next(100000, 999999).ToString();
            user.ForgotPasswordOtp = otp;
            user.OtpGeneratedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Send OTP via email
            try
            {
                await SendOtpEmail(user.Email, otp);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "OTP generated but email failed: " + ex.Message });
            }

            return Ok(new { message = "OTP sent to email" });
        }

        // ================= VERIFY OTP =================
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.Trim().ToLower());
            if (user == null) return BadRequest(new { message = "User not found" });

            if (user.ForgotPasswordOtp != dto.Otp)
                return BadRequest(new { message = "Invalid OTP" });

            if (user.OtpGeneratedAt == null || (DateTime.UtcNow - user.OtpGeneratedAt.Value).TotalMinutes > 10)
                return BadRequest(new { message = "OTP expired" });


            var resetToken = Guid.NewGuid().ToString();
            user.PasswordResetToken = resetToken;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(15);
            user.ForgotPasswordOtp = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = "OTP verified", resetToken });
        }

        // ================= RESET PASSWORD =================
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.PasswordResetToken == dto.ResetToken);
            if (user == null)
                return BadRequest(new { message = "Invalid or expired reset token" });

            if (user.PasswordResetTokenExpiry < DateTime.UtcNow)
                return BadRequest(new { message = "Reset token expired" });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully" });
        }

        // ================= SEND EMAIL =================
        private async Task SendOtpEmail(string toEmail, string otp)
        {
            var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential("akoshta59@gmail.com", "imsi ylfe iwor cojo"),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress("your_email@gmail.com"),
                Subject = "Foodime Password Reset OTP",
                Body = $"Your OTP is {otp}. It will expire in 10 minutes.",
                IsBodyHtml = false
            };

            mailMessage.To.Add(toEmail);
            await smtpClient.SendMailAsync(mailMessage);
        }
    }
}
