using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

namespace Foodime_Backend.Controllers
{
    [ApiController]
    [Route("api/location")]
    public class LocationController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public LocationController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        // GET: api/location/reverse?lat=...&lon=...
        [HttpGet("reverse")]
        public async Task<IActionResult> ReverseGeocode(double? lat, double? lon)
        {
            if (lat == null || lon == null)
            {
                return BadRequest(new
                {
                    error = true,
                    message = "Missing 'lat' or 'lon' parameter."
                });
            }

            var client = _httpClientFactory.CreateClient();

            // IMPORTANT: Nominatim requires User-Agent header
            client.DefaultRequestHeaders.UserAgent.Add(
                new ProductInfoHeaderValue("FoodimeReactApp", "1.0"));
            client.DefaultRequestHeaders.UserAgent.Add(
                new ProductInfoHeaderValue("(codetive3@gmail.com)"));

            var url =
                $"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}";

            try
            {
                var response = await client.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new
                    {
                        error = true,
                        message = "Failed to fetch address from external API."
                    });
                }

                var content = await response.Content.ReadAsStringAsync();

                return Content(content, "application/json");
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    error = true,
                    message = "External API call failed",
                    api_error = ex.Message
                });
            }
        }
    }
}