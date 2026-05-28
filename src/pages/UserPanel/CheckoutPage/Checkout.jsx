import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CreditCard, Banknote, ArrowLeft } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useCart } from "../../../context/useCart";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { getCartItems, getCartTotal, placeOrder } = useCart();
  const cartItems = getCartItems();
  const cartTotal = getCartTotal();

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const deliveryFee = cartTotal > 299 ? 0 : 30;
  const tax = Math.round(cartTotal * 0.05 * 100) / 100;
  const grandTotal = (cartTotal + deliveryFee + tax).toFixed(2);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !address.name ||
      !address.phone ||
      !address.address_1 ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      setError("Please fill in all required address fields.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);

    const jwtToken = localStorage.getItem("jwtToken");
    if (jwtToken) {
      try {
        const res = await fetch(
          "http://localhost/foodime/wp-json/foodime/v1/checkout",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: cartItems,
              address,
              payment_method: paymentMethod,
              total: grandTotal,
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          placeOrder({ address, paymentMethod, ...data });
          setLoading(false);
          navigate("/order-confirmation");
          return;
        }
      } catch {
        console.log("API checkout unavailable, using local checkout");
      }
    }

    setTimeout(() => {
      placeOrder({ address, paymentMethod });
      setLoading(false);
      navigate("/order-confirmation");
    }, 1000);
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-checkout">
          <h2>Your cart is empty</h2>
          <p>Add some items before checking out</p>
          <button onClick={() => navigate("/homepage")}>Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1>Checkout</h1>
      </div>

      <form onSubmit={handlePlaceOrder}>
        {error && <p className="checkout-error">{error}</p>}

        <section className="checkout-section">
          <h3>
            <MapPin size={18} /> Delivery Address
          </h3>
          <div className="form-grid">
            <input
              type="text"
              name="name"
              placeholder="Full Name *"
              value={address.name}
              onChange={handleAddressChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number *"
              value={address.phone}
              onChange={handleAddressChange}
              required
            />
            <input
              type="text"
              name="address_1"
              placeholder="Address Line 1 *"
              value={address.address_1}
              onChange={handleAddressChange}
              required
              className="full-width"
            />
            <input
              type="text"
              name="address_2"
              placeholder="Address Line 2 (optional)"
              value={address.address_2}
              onChange={handleAddressChange}
              className="full-width"
            />
            <input
              type="text"
              name="city"
              placeholder="City *"
              value={address.city}
              onChange={handleAddressChange}
              required
            />
            <input
              type="text"
              name="state"
              placeholder="State *"
              value={address.state}
              onChange={handleAddressChange}
              required
            />
            <input
              type="text"
              name="pincode"
              placeholder="PIN Code *"
              value={address.pincode}
              onChange={handleAddressChange}
              required
            />
          </div>
        </section>

        <section className="checkout-section">
          <h3>
            <CreditCard size={18} /> Payment Method
          </h3>
          <div className="payment-options">
            <label
              className={`payment-option ${paymentMethod === "cod" ? "active" : ""}`}
            >
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <Banknote size={20} />
              <span>Cash on Delivery</span>
            </label>
            <label
              className={`payment-option ${paymentMethod === "online" ? "active" : ""}`}
            >
              <input
                type="radio"
                name="payment"
                value="online"
                checked={paymentMethod === "online"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <CreditCard size={20} />
              <span>Online Payment</span>
            </label>
          </div>
        </section>

        <section className="checkout-section order-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item">
                <span className="item-name">
                  {item.name} x{item.quantity}
                </span>
                <span className="item-price">
                  {"\u20B9"}
                  {(parseFloat(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="summary-divider" />
          <div className="summary-row">
            <span>Subtotal</span>
            <span>
              {"\u20B9"}
              {cartTotal.toFixed(2)}
            </span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>
              {deliveryFee === 0 ? "FREE" : `${"\u20B9"}${deliveryFee}`}
            </span>
          </div>
          <div className="summary-row">
            <span>Tax (5%)</span>
            <span>
              {"\u20B9"}
              {tax.toFixed(2)}
            </span>
          </div>
          <div className="summary-divider" />
          <div className="summary-row total">
            <span>Total</span>
            <span>
              {"\u20B9"}
              {grandTotal}
            </span>
          </div>
        </section>

        <motion.button
          type="submit"
          className="place-order-btn"
          disabled={loading}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? "Placing Order..." : `Place Order - ${"\u20B9"}${grandTotal}`}
        </motion.button>
      </form>
    </div>
  );
};

export default Checkout;
