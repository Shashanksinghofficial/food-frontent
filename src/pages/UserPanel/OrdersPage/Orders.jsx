import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Clock, CheckCircle } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../../context/useCart";
import "./Orders.css";

const statusConfig = {
  confirmed: { label: "Confirmed", icon: <Clock size={14} />, color: "#f7931e" },
  preparing: { label: "Preparing", icon: <Clock size={14} />, color: "#2196f3" },
  "on-the-way": { label: "On The Way", icon: <Package size={14} />, color: "#9c27b0" },
  delivered: { label: "Delivered", icon: <CheckCircle size={14} />, color: "#4caf50" },
};

const Orders = () => {
  const navigate = useNavigate();
  const { orders } = useCart();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1>My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <Package size={48} />
          <h2>No orders yet</h2>
          <p>Your order history will appear here</p>
          <button onClick={() => navigate("/homepage")}>Start Ordering</button>
        </div>
      ) : (
        <div className="orders-list">
          <AnimatePresence>
            {orders.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig.confirmed;
              return (
                <motion.div
                  key={order.id}
                  className="order-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="order-card-header">
                    <div>
                      <span className="order-num">{order.order_number}</span>
                      <span className="order-date">
                        {formatDate(order.date)}
                      </span>
                    </div>
                    <span
                      className="order-status"
                      style={{ background: `${status.color}20`, color: status.color }}
                    >
                      {status.icon} {status.label}
                    </span>
                  </div>

                  <div className="order-items-list">
                    {order.items.map((item) => (
                      <div key={item.id} className="order-item-row">
                        <span>
                          {item.name} x{item.quantity}
                        </span>
                        <span>
                          {"\u20B9"}
                          {(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <span className="order-total">
                      Total: {"\u20B9"}
                      {order.total.toFixed(2)}
                    </span>
                    {order.paymentMethod && (
                      <span className="order-payment">
                        {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Orders;
