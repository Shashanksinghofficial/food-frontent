import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    terms: false,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameSuggestion, setUsernameSuggestion] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const toggleVisibility = (id) => {
    const input = document.getElementById(id);
    input.type = input.type === "password" ? "text" : "password";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "http://localhost/foodime/wp-content/plugins/foodime-plugin/src/signup.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(form),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setMessage("✅ Signup successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        if (data.error === "email_exists") {
          setMessage("❌ Email already registered");
        } else if (data.error === "username_exists") {
          setMessage("❌ Username already taken, try suggestion below");
          if (data.suggestion) {
            setUsernameSuggestion(data.suggestion);
            setForm({ ...form, username: data.suggestion }); // ✅ Auto-fill suggestion
          }
        } else {
          setMessage(data.data?.join(", ") || "❌ Signup failed");
        }
      }
    } catch (err) {
      setLoading(false);
      setMessage("❌ Network error. Please try again.");
    }
  };

  return (
    <div className="foodime-fullscreen">
      <form className="signup-box" onSubmit={handleSubmit}>
        <h2>Create Your Account</h2>
        {message && (
          <p
            className={
              message.includes("success") ? "success-msg" : "error-msg"
            }
          >
            {message}
          </p>
        )}

        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        {usernameSuggestion && (
          <p className="suggestion">
            Suggested: <strong>{usernameSuggestion}</strong>
          </p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />

        <div className="password-field">
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Create Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <i
            className="eye-icon"
            onClick={() => toggleVisibility("password")}
          />
        </div>

        <div className="password-field">
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            placeholder="Confirm Password"
            value={form.confirm_password}
            onChange={handleChange}
            required
          />
          <i
            className="eye-icon"
            onClick={() => toggleVisibility("confirm_password")}
          />
        </div>

        <label className="terms">
          <input
            type="checkbox"
            name="terms"
            checked={form.terms}
            onChange={handleChange}
            required
          />
          <span>
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noreferrer">
              terms & conditions
            </a>
            .
          </span>
        </label>

        {loading ? (
          <div className="loader" />
        ) : (
          <button type="submit">Sign Up</button>
        )}

        <p className="auth-link">
          Already have an account?{" "}
          <span id="have-accounts" onClick={() => navigate("/login")}>
            Login here
          </span>
        </p>
      </form>
    </div>
  );
}

export default Signup;
