// src/pages/DeliveryLogin.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./DeliveryLogin.css"; // Common styling for login and register

// Optional: You might need to import icons. For simplicity, we'll use emojis or basic text here.
// For a real app, consider a library like react-icons (e.g., import { FaEye, FaEyeSlash } from 'react-icons/fa';)

function DeliveryLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // This line correctly gets the API root from global settings defined by WordPress
  const apiRoot = window.foodimeApiSettings?.root || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiRoot}foodime/v1/delivery-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json(); // Always parse JSON to get error details

      if (!response.ok) {
        // If response is not 2xx, parse error from server.
        // Your PHP API now sends 'message' and 'code' on error.
        throw new Error(
          data.message || "Login failed. Server responded with an error."
        );
      }

      if (data.status === "success") {
        // Store the entire API response data as a JSON string in a single localStorage item
        localStorage.setItem("foodimeDeliveryUser", JSON.stringify(data));

        // Redirect based on API response or a default path
        const redirectTo = data.redirect_to || "/delivery-panel";
        navigate(redirectTo); // Redirect the user to the delivery panel or specified path
      } else {
        // Handle specific login failure messages from the API (e.g., wrong credentials, account not approved)
        setError(
          data.message || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.message || "Network error. Could not connect to the server."
      );
    } finally {
      setLoading(false); // Always stop loading, regardless of success or failure
    }
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="delivery-login-container">
      <div className="login-card">
        <h2>Foodime Delivery Partner Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username / Email</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group password-group">
            {" "}
            {/* Added class for styling password eye */}
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? "text" : "password"} // Dynamically change type
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <span
              className="password-toggle"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {/* Simple text/emoji for eye icon. Replace with actual icons if using react-icons */}
              {showPassword ? "🙈" : "👁️"}
              {/* Or use react-icons: {showPassword ? <FaEyeSlash /> : <FaEye />} */}
            </span>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>
        <p className="register-link">
          New partner? <Link to="/delivery-register">Register Here</Link>
        </p>
      </div>
    </div>
  );
}

export default DeliveryLogin;
