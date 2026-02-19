import { useNavigate } from "react-router-dom";
import "./Registration.css";

function Registration() {
  const navigate = useNavigate();

  const handleGuest = () => {
    navigate("/homepage?guest=1");
  };

  return (
    <div className="registration-page">
      <div className="glass-container">
        <div className="glass-card">
          <h2>Welcome to Foodime</h2>
          <p>Please choose how you'd like to continue</p>

          <button className="foodime-btn" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
          <button className="foodime-btn" onClick={() => navigate("/login")}>
            Login
          </button>

          <div className="guest-note">
            Or{" "}
            <span
              style={{ color: "#ffd700", cursor: "pointer" }}
              onClick={handleGuest}
            >
              Continue as Guest
            </span>{" "}
            to explore our menu 🍽️
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;
