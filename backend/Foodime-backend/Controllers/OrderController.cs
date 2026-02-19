using Microsoft.AspNetCore.Mvc;

namespace Foodime_backend.Controllers
{
    public class OrderController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
