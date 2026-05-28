import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Package,
  Heart,
  LogOut,
  ChevronRight,
  Settings,
  HelpCircle,
  Shield,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useCart } from "../../../context/useCart";
import "./AccountPage.css";

const AccountPage = () => {
  const navigate = useNavigate();
  const { orders, wishlist, getCartCount } = useCart();
  const jwtToken = localStorage.getItem("jwtToken");

  const [userData] = useState(() => {
    const saved = localStorage.getItem("foodimeUserData");
    return saved
      ? JSON.parse(saved)
      : {
          name: "Foodime User",
          email: "user@foodime.com",
          phone: "+91 9876543210",
          address: "Mahatma Gandhi Road, Agra, UP",
        };
  });

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("foodimeUserData");
    navigate("/login");
  };

  const menuItems = [
    {
      icon: <Package size={20} />,
      label: "My Orders",
      subtitle: `${orders.length} orders placed`,
      action: () => navigate("/orders"),
    },
    {
      icon: <Heart size={20} />,
      label: "Wishlist",
      subtitle: `${wishlist.length} items saved`,
      action: () => navigate("/wishlist"),
    },
    {
      icon: <MapPin size={20} />,
      label: "Saved Addresses",
      subtitle: "Manage delivery addresses",
      action: () => {},
    },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      subtitle: "Notifications, theme, language",
      action: () => {},
    },
    {
      icon: <Shield size={20} />,
      label: "Privacy & Security",
      subtitle: "Password, data preferences",
      action: () => {},
    },
    {
      icon: <HelpCircle size={20} />,
      label: "Help & Support",
      subtitle: "FAQs, contact us",
      action: () => {},
    },
  ];

  return (
    <div className="account-page">
      <motion.div
        className="account-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="avatar">
          <User size={40} />
        </div>
        <div className="user-details">
          <h2>{userData.name}</h2>
          <p>{userData.email}</p>
          <p className="phone">{userData.phone}</p>
        </div>
        <button className="edit-profile-btn">Edit</button>
      </motion.div>

      <div className="account-stats">
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className="stat-number">{orders.length}</span>
          <span className="stat-label">Orders</span>
        </motion.div>
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="stat-number">{wishlist.length}</span>
          <span className="stat-label">Wishlist</span>
        </motion.div>
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="stat-number">{getCartCount()}</span>
          <span className="stat-label">In Cart</span>
        </motion.div>
      </div>

      <div className="account-menu">
        {menuItems.map((item, index) => (
          <motion.div
            key={index}
            className="menu-item"
            onClick={item.action}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="menu-icon">{item.icon}</div>
            <div className="menu-text">
              <span className="menu-label">{item.label}</span>
              <span className="menu-subtitle">{item.subtitle}</span>
            </div>
            <ChevronRight size={18} className="menu-arrow" />
          </motion.div>
        ))}
      </div>

      <motion.button
        className="logout-btn"
        onClick={handleLogout}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <LogOut size={18} />
        <span>Logout</span>
      </motion.button>

      {!jwtToken && (
        <p className="login-prompt">
          <span onClick={() => navigate("/login")}>Login</span> to see your
          full account details
        </p>
      )}
    </div>
  );
};

export default AccountPage;
