import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 Backend URL from Vite env
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          EmailOrUsername: username,
          Password: password,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.token) {
        // ✅ Save JWT token
        localStorage.setItem("jwtToken", data.token);
        navigate("/homepage"); // redirect after login
      } else {
        setMsg(data.message || "Login failed");
      }
    } catch (error) {
      setLoading(false);
      console.error("Login fetch error:", error);
      setMsg("❌ Network error. Please try again.");
    }
  };

  return (
    <div className="foodime-login-wrap">
      <div className="auth-card">
        <h2>Welcome Back 👋</h2>
        {msg && <p style={{ color: "red" }}>{msg}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Email or Username"
            required
          />
          <div className="password-container">
            <div className="password-field">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <i
                className="eye-icon"
                onClick={() =>
                  document.getElementById("password").type === "password"
                    ? (document.getElementById("password").type = "text")
                    : (document.getElementById("password").type = "password")
                }
              />
            </div>

            <span
              className="forgot-password"
              onClick={() => navigate("/forget-password")}
            >
              Forgot?
            </span>
          </div>

          {loading ? (
            <div className="loader" />
          ) : (
            <button type="submit">Login</button>
          )}
        </form>

        <p className="auth-link">
          Don’t have an account?{" "}
          <span id="have-account" onClick={() => navigate("/signup")}>
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
