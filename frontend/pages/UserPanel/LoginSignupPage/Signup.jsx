import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const [form, setForm] = useState({
    FirstName: "",
    LastName: "",
    Username: "",
    Email: "",
    Phone: "",
    Password: "",
    confirm_password: "",
    terms: false,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameSuggestion, setUsernameSuggestion] = useState("");
  const navigate = useNavigate();

  // Prevent page scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });

    // Optional automatic suggestion for UX
    if (name === "Username" && value.trim().length < 4) {
      const suggestion =
        form.FirstName.toLowerCase() +
        Math.floor(Math.random() * 1000).toString();
      setUsernameSuggestion(suggestion);
    } else if (name === "Username") {
      setUsernameSuggestion("");
    }
  };

  // Toggle password visibility
  const toggleVisibility = (id) => {
    const input = document.getElementById(id);
    input.type = input.type === "password" ? "text" : "password";
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.Password !== form.confirm_password) {
      setMessage("❌ Password and Confirm Password do not match.");
      return;
    }

    if (!form.terms) {
      setMessage("❌ You must agree to the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5206/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FirstName: form.FirstName.trim(),
          LastName: form.LastName.trim(),
          Username: form.Username.trim(),
          Email: form.Email.trim(),
          Phone: form.Phone.trim(),
          Password: form.Password,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        if (data.suggestion) setUsernameSuggestion(data.suggestion);
        setMessage(`❌ ${data.message}`);
        return;
      }

      setMessage("✅ Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setLoading(false);
      setMessage("❌ Network error. Please try again later.");
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
          name="FirstName"
          placeholder="First Name"
          value={form.FirstName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="LastName"
          placeholder="Last Name"
          value={form.LastName}
          onChange={handleChange}
          required
        />

        <div style={{ position: "relative" }}>
          <input
            type="text"
            name="Username"
            placeholder="Username"
            value={form.Username}
            onChange={handleChange}
            required
          />
          {usernameSuggestion && (
            <div className="username-suggestion-dropdown">
              <p>Select a suggested username:</p>
              <ul>
                {[
                  usernameSuggestion,
                  usernameSuggestion + "99",
                  usernameSuggestion + "88",
                ].map((sugg, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setForm({ ...form, Username: sugg });
                      setUsernameSuggestion(""); // hide dropdown
                    }}
                  >
                    {sugg}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <input
          type="email"
          name="Email"
          placeholder="Email Address"
          value={form.Email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="Phone"
          placeholder="Phone Number"
          value={form.Phone || ""}
          onChange={handleChange}
          required
        />

        <div className="password-field">
          <input
            type="password"
            id="password"
            name="Password"
            placeholder="Create Password"
            value={form.Password}
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

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>

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
