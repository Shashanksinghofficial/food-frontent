import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./ShopPage.css";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastQueue, setToastQueue] = useState([]);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const navigate = useNavigate();
  const debounceTimers = useRef({});

  // Toast helper
  const showToast = (msg, type = "black") => {
    const id = Date.now();
    setToastQueue((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToastQueue((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  };

  const fetchCart = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setError("Please login first");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "http://localhost/foodime/wp-json/foodime/v1/cart",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ send JWT token
          },
        }
      );

      if (res.status === 403) {
        setError("Session expired, please login again");
        setCartItems([]);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(`Failed to fetch cart: ${res.status}`);
      const data = await res.json();
      const items = data.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity,
        image: item.image?.src || "",
      }));
      setCartItems(items);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = (item, qty) => {
    if (qty < 1) return;

    if (debounceTimers.current[item.id])
      clearTimeout(debounceTimers.current[item.id]);

    debounceTimers.current[item.id] = setTimeout(async () => {
      setUpdatingItemId(item.id);
      const token = localStorage.getItem("jwtToken");
      try {
        const res = await fetch(
          `http://localhost/foodime/wp-json/foodime/v1/cart/${item.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ✅ send JWT
            },
            body: JSON.stringify({ quantity: qty }),
          }
        );
        if (!res.ok) throw new Error("Failed to update quantity");
        const updatedCart = await res.json();
        const items = updatedCart.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: item.quantity,
          image: item.image?.src || "",
        }));
        setCartItems(items);
        showToast(`${item.name} quantity updated`);
      } catch (err) {
        showToast(err.message);
      } finally {
        setUpdatingItemId(null);
      }
    }, 300);
  };

  const removeItem = async (item) => {
    setUpdatingItemId(item.id);
    const token = localStorage.getItem("jwtToken");
    try {
      const res = await fetch(
        `http://localhost/foodime/wp-json/foodime/v1/cart/${item.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ send JWT
          },
        }
      );
      if (!res.ok) throw new Error("Failed to remove item");
      const updatedCart = await res.json();
      const items = updatedCart.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity,
        image: item.image?.src || "",
      }));
      setCartItems(items);
      showToast(`${item.name} removed from cart`);
    } catch (err) {
      showToast(err.message);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
    .toFixed(2);

  if (loading)
    return (
      <div className="shop-loading">
        <div className="spinner"></div>
        <span>Loading cart...</span>
      </div>
    );

  if (error)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <h2>{error}</h2>
        <button
          onClick={() => (window.location.href = "/login")}
          style={{ padding: 10 }}
        >
          Login Here →
        </button>
      </div>
    );

  return (
    <div className="shop-page">
      <h1 className="shop-title">🛒 My Cart</h1>

      {cartItems.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "40px" }}>
          Your cart is empty.
        </p>
      ) : (
        <div className="products-grid">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                className="product-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                whileHover={{ scale: 1.03 }}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="product-image"
                  />
                )}
                <div className="product-info">
                  <h3 className="product-name">{item.name}</h3>
                  <p className="product-price">₹{item.price}</p>

                  <div className="cart-actions">
                    <motion.div
                      className="quantity-controls"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                    >
                      <button
                        disabled={updatingItemId === item.id}
                        onClick={() => updateQuantity(item, item.quantity - 1)}
                      >
                        <Minus size={18} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        disabled={updatingItemId === item.id}
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                      >
                        <Plus size={18} />
                      </button>
                      <button
                        style={{ marginLeft: "8px" }}
                        disabled={updatingItemId === item.id}
                        onClick={() => removeItem(item)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {cartItems.length > 0 && (
        <motion.div
          className="cart-summary"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
        >
          <ShoppingCart size={20} />
          <span>
            {totalItems} items | ₹{totalPrice}
          </span>
          <button
            className="checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Checkout
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {toastQueue.map((toast) => (
          <motion.div
            key={toast.id}
            className={`cart-toast ${toast.type}`}
            initial={{ y: -60, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -40, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
          >
            {toast.type === "black" && (
              <CheckCircle size={18} style={{ marginRight: "6px" }} />
            )}
            {toast.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;
