import { useNavigate } from "react-router-dom";
import { CheckCircle, Package, Home } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useCart } from "../../../context/useCart";
import "./OrderConfirmation.css";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { orders } = useCart();
  const latestOrder = orders.length > 0 ? orders[0] : null;

  return (
    <div className="order-confirmation-page">
      <motion.div
        className="confirmation-card"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <motion.div
          className="success-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle size={64} />
        </motion.div>

        <h1>Order Placed!</h1>
        <p className="confirmation-text">
          Your order has been placed successfully.
        </p>

        {latestOrder && (
          <div className="order-info">
            <p className="order-number">
              Order #{latestOrder.order_number}
            </p>
            <p className="order-total">
              Total: {"\u20B9"}
              {latestOrder.total.toFixed(2)}
            </p>
            <p className="order-items">
              {latestOrder.items.length} item
              {latestOrder.items.length > 1 ? "s" : ""}
            </p>
          </div>
        )}

        <div className="delivery-estimate">
          <Package size={20} />
          <span>Estimated delivery: 30-45 minutes</span>
        </div>

        <div className="confirmation-actions">
          <motion.button
            className="track-btn"
            onClick={() => navigate("/orders")}
            whileTap={{ scale: 0.95 }}
          >
            <Package size={18} />
            View Orders
          </motion.button>
          <motion.button
            className="home-btn"
            onClick={() => navigate("/homepage")}
            whileTap={{ scale: 0.95 }}
          >
            <Home size={18} />
            Back to Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderConfirmation;
