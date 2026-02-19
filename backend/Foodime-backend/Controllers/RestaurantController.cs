using Microsoft.AspNetCore.Mvc;

namespace Foodime_backend.Controllers
{
    public class RestaurantController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
