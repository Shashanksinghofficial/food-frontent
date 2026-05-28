import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../../context/useCart";
import "./ShopPage.css";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    getCartItems,
    getCartTotal,
    getCartCount,
    addToCart,
    removeFromCart,
    deleteFromCart,
  } = useCart();

  const [toastQueue, setToastQueue] = useState([]);
  const [apiItems, setApiItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const jwtToken = localStorage.getItem("jwtToken");

  const showToast = (msg, type = "black") => {
    const id = Date.now();
    setToastQueue((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToastQueue((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  };

  useEffect(() => {
    if (!jwtToken) {
      setLoading(false);
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await fetch(
          "http://localhost/foodime/wp-json/foodime/v1/cart",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setApiItems(data.items || []);
        }
      } catch {
        console.log("API cart unavailable, using local cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [jwtToken]);

  const cartItems = apiItems || getCartItems();
  const totalItems = apiItems
    ? cartItems.reduce((acc, item) => acc + item.quantity, 0)
    : getCartCount();
  const totalPrice = apiItems
    ? cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)
    : getCartTotal().toFixed(2);

  const handleIncrease = (item) => {
    if (!apiItems) {
      addToCart(item);
      showToast(`${item.name} quantity updated`);
    }
  };

  const handleDecrease = (item) => {
    if (!apiItems) {
      removeFromCart(item.id);
      showToast(`${item.name} quantity updated`);
    }
  };

  const handleRemove = (item) => {
    if (!apiItems) {
      deleteFromCart(item.id);
      showToast(`${item.name} removed from cart`);
    }
  };

  if (loading)
    return (
      <div className="shop-loading">
        <div className="spinner"></div>
        <span>Loading cart...</span>
      </div>
    );

  return (
    <div className="shop-page">
      <h1 className="shop-title">My Cart</h1>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p>Your cart is empty.</p>
          <button
            style={{
              background: "#ff6b35",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "16px",
            }}
            onClick={() => navigate("/homepage")}
          >
            Browse Menu
          </button>
        </div>
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
                {(item.image || (item.images && item.images.length > 0)) && (
                  <img
                    src={item.image || item.images[0].src}
                    alt={item.name}
                    className="product-image"
                  />
                )}
                <div className="product-info">
                  <h3 className="product-name">{item.name}</h3>
                  <p className="product-price">
                    {"\u20B9"}
                    {item.price}
                  </p>

                  <div className="cart-actions">
                    <motion.div
                      className="quantity-controls"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                    >
                      <button onClick={() => handleDecrease(item)}>
                        <Minus size={18} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleIncrease(item)}>
                        <Plus size={18} />
                      </button>
                      <button
                        style={{ marginLeft: "8px" }}
                        onClick={() => handleRemove(item)}
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
            {totalItems} items | {"\u20B9"}
            {totalPrice}
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
