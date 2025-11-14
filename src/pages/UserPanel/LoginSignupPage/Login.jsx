import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(
        "http://localhost/foodime/wp-json/jwt-auth/v1/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
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
