// src/App.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import Layout from "./components/Layout";

// User Panel Pages
import Landing from "./pages/UserPanel/LandingPage/Landing";
import Registration from "./pages/UserPanel/UserRegistrationPage/Registration";
import Signup from "./pages/UserPanel/LoginSignupPage/Signup";
import Login from "./pages/UserPanel/LoginSignupPage/Login";
import ShopPage from "./pages/UserPanel/UserHomePage/ShopPage";
import CartPage from "./pages/UserPanel/UserHomePage/CartPage";
import AccountPage from "./pages/UserPanel/UserHomePage/AccountPage";
import ProductDetail from "./pages/UserPanel/ProductPage/ProductDetail"; // ✅ fixed

// Delivery Panel Pages
import DeliveryLogin from "./pages/DeliveryPanel/DeliveryLogin";
import DeliveryPanel from "./pages/DeliveryPanel/DeliveryPanel";
import DeliveryRegister from "./pages/DeliveryPanel/DeliveryRegister";

function App() {
  // Simple delivery user authentication check
  const isAuthenticated = () =>
    localStorage.getItem("foodimeDeliveryUser") !== null;

  return (
    <Routes>
      {/* 1. Public Routes (no layout) */}
      <Route path="/" element={<Landing />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/delivery-login" element={<DeliveryLogin />} />
      <Route path="/delivery-register" element={<DeliveryRegister />} />

      {/* 2. Routes with Layout (Header + Footer) */}
      <Route element={<Layout />}>
        <Route path="/homepage" element={<ShopPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />{" "}
        {/* ✅ Added */}
      </Route>

      {/* 3. Delivery Panel Route (authenticated only) */}
      <Route
        path="/delivery-panel"
        element={
          isAuthenticated() ? (
            <DeliveryPanel />
          ) : (
            <Navigate to="/delivery-login" />
          )
        }
      />

      {/* 4. Catch-all route */}
      <Route path="*" element={<div>404 - Page Not Found (Foodime App)</div>} />
    </Routes>
  );
}

export default App;
