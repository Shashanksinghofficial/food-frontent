import { useState, useEffect } from "react";
import "./MyAccount.css";

const MyAccount = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("profile");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [profilePic, setProfilePic] = useState(null);

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const fetchUser = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "http://localhost/foodime/wp-json/wp/v2/users/me",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser({
        ...data,
        real_username:
          data.meta?.custom_username ||
          data.custom_username ||
          data.acf?.custom_username ||
          data.username,

        role: data.roles ? data.roles[0] : "customer",
      });
    } catch (e) {
      setUser(null);
    }
    setLoading(false);
  };

  const updateRealUsername = async () => {
    const token = localStorage.getItem("jwtToken");
    const res = await fetch(
      "http://localhost/foodime/wp-json/foodime/v1/update-username",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      }
    );
    const data = await res.json();
    if (data.status === "error") alert(data.message);
    //if (data.status === "success") alert("Username updated successfully ✔");
  };

  const updateProfile = async () => {
    const token = localStorage.getItem("jwtToken");

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const bodyData = {
      name: fullName,
      display_name: fullName,
      first_name: firstName,
      last_name: lastName,
      nickname: fullName,
      email: email, // <-- FIX
      meta: { custom_username: username },
    };

    // Handle profile picture upload separately if selected
    if (profilePic) {
      const formData = new FormData();
      formData.append("file", profilePic);
      formData.append("title", fullName + " Profile Pic");
      formData.append("alt_text", fullName);

      await fetch("http://localhost/foodime/wp-json/wp/v2/media", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    }

    const res = await fetch(
      `http://localhost/foodime/wp-json/wp/v2/users/${user.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      }
    );
    const data = await res.json();

    if (res.ok) {
      await updateRealUsername();
      await new Promise((res) => setTimeout(res, 300));
      alert("Profile updated successfully ✔");
      await fetchUser();
      setShowEditModal(false);
    } else {
      alert("Update failed ❌");
      console.log(data);
    }
  };

  const changePassword = async () => {
    if (newPass !== confirmPass) return alert("Passwords do not match ❌");

    const token = localStorage.getItem("jwtToken");
    const res = await fetch(
      `http://localhost/foodime/wp-json/wp/v2/users/${user.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPass }),
      }
    );
    if (res.ok) {
      alert("Password updated successfully ✔");
      setShowPasswordModal(false);
    } else alert("Failed to update password ❌");
  };

  const sendResetLink = async () => {
    const res = await fetch(
      "http://localhost/foodime/wp-json/wp/v2/users/lost-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      }
    );
    if (res.ok) {
      alert("Reset link sent to your email ✔");
      setShowForgotModal(false);
    } else alert("Unable to send reset link ❌");
  };

  const doLogout = () => {
    localStorage.removeItem("jwtToken");
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) return <h2 className="center">Loading My Account…</h2>;
  if (!user)
    return (
      <div className="center">
        <h2>You are not logged in ❌</h2>
        <button
          className="primary-btn"
          onClick={() => (window.location.href = "/login")}
        >
          Login Here →
        </button>
      </div>
    );

  return (
    <div className="account-container">
      <h1>My Account</h1>
      <div className="tabs">
        <button onClick={() => setActiveTab("profile")}>Profile</button>
        <button onClick={() => setActiveTab("orders")}>Orders</button>
        <button onClick={() => setActiveTab("address")}>Address</button>
        <button className="logout-btn" onClick={doLogout}>
          Logout
        </button>
      </div>

      {activeTab === "profile" && (
        <>
          <h2>Profile Details</h2>
          <img
            className="profile-img"
            src={user.avatar_urls?.["96"]}
            alt="profile"
          />
          <p>
            <b>Name:</b> {user.name}
          </p>
          <p>
            <b>Username:</b> {user.username}
          </p>
          <p>
            <b>Email:</b> {user.email}
          </p>
          <p>
            <b>Role:</b> {user.role}
          </p>

          <button
            className="edit-btn"
            onClick={() => {
              setFullName(user.display_name);
              setUsername(user.meta?.custom_username || user.slug);
              setEmail(user.email);
              setProfilePic(null);
              setShowEditModal(true);
            }}
          >
            Edit Profile ✏️
          </button>
          <button
            className="password-btn"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password 🔑
          </button>
          <button
            className="password-btn"
            onClick={() => setShowForgotModal(true)}
          >
            Forgot Password ❓
          </button>
        </>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Profile</h2>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePic(e.target.files[0])}
              className="input"
            />
            {profilePic && <p>Selected: {profilePic.name}</p>}

            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="input"
            />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="input"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input"
            />

            <button className="primary-btn" onClick={updateProfile}>
              Save Changes
            </button>
            <button
              className="cancel-btn"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPasswordModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Change Password</h2>
            <input
              type="password"
              className="input"
              placeholder="New Password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
            <input
              type="password"
              className="input"
              placeholder="Confirm Password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
            <button className="primary-btn" onClick={changePassword}>
              Update Password
            </button>
            <button
              className="cancel-btn"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowForgotModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Reset Password</h2>
            <p>We will send a reset link to your email:</p>
            <p>
              <b>{user.email}</b>
            </p>
            <button className="primary-btn" onClick={sendResetLink}>
              Send Reset Link
            </button>
            <button
              className="cancel-btn"
              onClick={() => setShowForgotModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAccount;
