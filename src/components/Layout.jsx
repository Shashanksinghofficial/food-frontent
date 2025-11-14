import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaHome, FaShoppingCart, FaUser } from "react-icons/fa";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./Layout.css";

const Layout = () => {
  const [address, setAddress] = useState(
    "Mahatma Gandhi Road, Shahganj, Agra, Uttar Pradesh, 282002, India"
  );
  const [coordinates, setCoordinates] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activePage, setActivePage] = useState("homepage");

  const topBarRef = useRef(null);
  const footerNavRef = useRef(null);
  const circleRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Update active page based on URL
  useEffect(() => {
    const path = location.pathname.replace("/", "");
    setActivePage(path || "homepage");
  }, [location.pathname]);

  // Dynamic header/footer heights
  useEffect(() => {
    const setDynamicHeights = () => {
      if (topBarRef.current)
        document.documentElement.style.setProperty(
          "--top-bar-height",
          `${topBarRef.current.offsetHeight}px`
        );
      if (footerNavRef.current)
        document.documentElement.style.setProperty(
          "--footer-nav-height",
          `${footerNavRef.current.offsetHeight}px`
        );
    };
    setDynamicHeights();
    window.addEventListener("resize", setDynamicHeights);
    return () => window.removeEventListener("resize", setDynamicHeights);
  }, []);

  // Get user geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setCoordinates({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }),
        (err) => console.warn("Geolocation not allowed", err)
      );
    }
  }, []);

  // Fetch human-readable address from PHP proxy
  useEffect(() => {
    if (coordinates) {
      const fetchAddress = async () => {
        try {
          const res = await fetch(
            `http://localhost/foodime/wp-content/plugins/foodime-plugin/location-proxy.php?lat=${coordinates.lat}&lon=${coordinates.lon}`
          );
          const data = await res.json();
          if (!data.error) {
            setAddress(data.display_name || "Address not found");
          } else {
            console.warn("Error fetching address:", data.message);
          }
        } catch (err) {
          console.error("Failed to fetch address:", err);
        }
      };
      fetchAddress();
    }
  }, [coordinates]);

  // Fetch unread notifications
  /*useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch(
          "http://localhost/foodime/wp-content/plugins/foodime-plugin/get-unread-notifications.php",
          { method: "GET", credentials: "include" }
        );
        const data = await res.json();
        if (data.success) setUnreadCount(data.unread || 0);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);*/

  // Move footer circle and navigate
  const moveCircle = (targetPage) => {
    const circle = circleRef.current;
    if (!circle) return;

    navigate(targetPage === "homepage" ? "/homepage" : `/${targetPage}`);

    const home = document.querySelector(".footer-nav-item.home");
    const cart = document.querySelector(".footer-nav-item.cart");
    const account = document.querySelector(".footer-nav-item.account");

    let target = home;
    if (targetPage === "cart") target = cart;
    else if (targetPage === "account") target = account;

    const rect = target.getBoundingClientRect();
    const navRect = target.parentElement.getBoundingClientRect();
    const left =
      rect.left - navRect.left + rect.width / 2 - circle.offsetWidth / 2;

    circle.style.left = `${left}px`;
    circle.style.transform = "scale(1.2)";
    setTimeout(() => (circle.style.transform = "scale(1)"), 200);
  };

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="top-bar" ref={topBarRef}>
        <div className="top-left">
          <div className="logo-container">
            <img
              src="/assets/brandlogo.png"
              alt="Logo"
              className="topbar-logo"
            />
          </div>
          <div className="location-info">
            {address}
            {coordinates && (
              <span className="coords">
                ({coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)})
              </span>
            )}
          </div>
        </div>

        <div className="notification-bell-container">
          <FaBell className="notification-bell" />
          {unreadCount > 0 && (
            <span className="notification-count">{unreadCount}</span>
          )}
        </div>
      </header>

      {/* Main Content (Nested Routes) */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <nav className="footer-nav" ref={footerNavRef}>
        <span className="circle-indicator" ref={circleRef}></span>

        <div
          className={`footer-nav-item home ${
            activePage === "homepage" ? "active" : ""
          }`}
          onClick={() => moveCircle("homepage")}
        >
          <FaHome />
          <span>Home</span>
        </div>

        <div
          className={`footer-nav-item cart ${
            activePage === "cart" ? "active" : ""
          }`}
          onClick={() => moveCircle("cart")}
        >
          <FaShoppingCart />
          <span>Cart</span>
        </div>

        <div
          className={`footer-nav-item account ${
            activePage === "account" ? "active" : ""
          }`}
          onClick={() => moveCircle("account")}
        >
          <FaUser />
          <span>Account</span>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
