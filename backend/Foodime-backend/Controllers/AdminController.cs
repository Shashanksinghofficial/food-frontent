using Microsoft.AspNetCore.Mvc;

namespace Foodime_backend.Controllers
{
    public class AdminController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
