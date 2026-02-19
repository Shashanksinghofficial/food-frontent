import React, { useState } from "react";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [resetToken, setResetToken] = useState("");

  const API_BASE = "http://localhost:5206/api/auth";

  // ================= Send OTP =================
  const sendOtp = async () => {
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMsg(data.message);
      if (res.ok) setStep(2);
    } catch (err) {
      setMsg("Error sending OTP");
    }
  };

  // ================= Verify OTP =================
  const verifyOtp = async () => {
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      setMsg(data.message);
      if (res.ok) {
        setResetToken(data.resetToken);
        setStep(3);
      }
    } catch (err) {
      setMsg("Error verifying OTP");
    }
  };

  // ================= Reset Password =================
  const resetPassword = async () => {
    setMsg("");
    if (newPassword !== confirmPassword) {
      setMsg("Passwords do not match!");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      setMsg(data.message);
      if (res.ok) setTimeout(() => window.location.reload(), 2000); // redirect/login
    } catch (err) {
      setMsg("Error resetting password");
    }
  };

  return (
    <div className="auth-card">
      {step === 1 && (
        <>
          <h2>Forgot Password</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Verify OTP</h2>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}

      {step === 3 && (
        <>
          <h2>Reset Password</h2>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button onClick={resetPassword}>Reset Password</button>
        </>
      )}

      {msg && <p className="auth-msg">{msg}</p>}
    </div>
  );
};

export default ForgotPassword;
