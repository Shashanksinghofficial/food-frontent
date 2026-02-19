// src/pages/Landing.jsx

import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Typed from "typed.js";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa"; // 🔹 Social Icons
import "./Landing.css";

const bgVideo = "/assets/bg-v.mp4";

function Landing() {
  const typedRef = useRef(null);
  const location = useLocation();

  // 🔹 Typed.js setup
  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: [
        "Welcome to Foodime",
        "Discover Deliciousness!",
        "Order Fresh. Eat Happy!",
      ],
      typeSpeed: 50,
      backSpeed: 25,
      backDelay: 2000,
      loop: true,
      cursorChar: "|",
    });

    return () => typed.destroy();
  }, []);

  // 🔹 Sirf landing route par hi dikhana hai
  if (location.pathname !== "/foodime/" && location.pathname !== "/") {
    return null;
  }

  return (
    <div className="foodime-landing">
      {/* 🔹 Top-right section (Business link + Social icons) */}
      <div className="top-right">
        <a
          href="https://i.postimg.cc/WzV5Svm7/ROG-GX550-wallpaper-1920x1080.jpg"
          download="foodime-wallpaper.jpg"
          className="business-link"
        >
          Download Foodime
        </a>
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <FaFacebookF />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <FaInstagram />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <FaTwitter />
          </a>
        </div>
      </div>

      {/* 🔹 Background video */}
      <video autoPlay muted loop playsInline className="bg-video">
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 🔹 Typed heading */}
      <h1 className="foodime-heading">
        <span ref={typedRef}></span>
      </h1>

      {/* 🔹 CTA button */}
      <Link className="btn-start" to="/registration">
        Get Started
      </Link>
    </div>
  );
}

export default Landing;
