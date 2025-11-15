import { useState, useEffect } from "react";

const MyAccount = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (e) {
      console.log("User fetch error:", e);
      setUser(null);
    }

    setLoading(false);
  };

  const doLogout = () => {
    localStorage.removeItem("jwtToken");
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading)
    return (
      <h2 style={{ textAlign: "center", marginTop: 50 }}>
        Loading My Account…
      </h2>
    );

  if (!user)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <h2>You are not logged in ❌</h2>

        <button
          onClick={() => (window.location.href = "/login")}
          style={{ padding: 10 }}
        >
          Login Here →
        </button>
      </div>
    );

  return (
    <div style={{ padding: 20 }}>
      <h1>My Account</h1>

      <p>
        <b>Name:</b> {user.name}
      </p>
      <p>
        <b>Username:</b> {user.slug}
      </p>
      <p>
        <b>Email:</b> {user.email}
      </p>

      <button
        onClick={doLogout}
        style={{
          marginTop: 20,
          padding: 10,
          background: "red",
          color: "white",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default MyAccount;
