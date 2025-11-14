// src/pages/DeliveryPanel.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./DeliveryPanel.css"; // Create this CSS file for panel specific styles

function DeliveryPanel() {
  const navigate = useNavigate();
  const apiRoot = window.foodimeApiSettings?.root || "";
  const websocketUrl =
    window.foodimeApiSettings?.websocketUrl || "ws://localhost:3001"; // Your WebSocket server URL

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // State to hold selected order for detail view
  const wsRef = useRef(null); // Ref to hold WebSocket connection
  const locationIntervalRef = useRef(null); // Ref to hold location update interval

  // Fetch user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("foodimeDeliveryUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      console.log("User loaded:", parsedUser);
    } else {
      // If no user data, redirect to login
      console.log("No user data found, redirecting to login.");
      navigate("/delivery-login");
    }
  }, [navigate]);

  // Function to fetch orders
  const fetchOrders = useCallback(async () => {
    if (!user || !user.token) {
      setError("Authentication token missing. Please log in again.");
      setLoading(false);
      navigate("/delivery-login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiRoot}foodime/v1/delivery-orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": user.token, // Send nonce for authentication
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // If the server explicitly returns an error due to permission (e.g., not approved)
        if (response.status === 403) {
          setError(data.message || "You are not authorized to view orders.");
          // Potentially clear user data and redirect to login if account is not approved
          localStorage.removeItem("foodimeDeliveryUser");
          setTimeout(() => navigate("/delivery-login"), 3000);
        } else {
          throw new Error(data.message || "Failed to fetch orders.");
        }
      } else {
        if (data.success) {
          setOrders(data.data);
          console.log("Orders fetched:", data.data);
        } else {
          setError(data.message || "Failed to fetch orders.");
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Network error while fetching orders.");
    } finally {
      setLoading(false);
    }
  }, [user, apiRoot, navigate]);

  // Fetch orders on user data availability
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!user || !user.token || !websocketUrl) return;

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    wsRef.current = new WebSocket(websocketUrl);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected. Authenticating...");
      // Send a custom authentication message if your WebSocket server supports it
      // wsRef.current.send(JSON.stringify({ type: 'authenticate', token: user.token, userId: user.user_id }));
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("WebSocket message received:", message);

      if (message.type === "order_status_update") {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === message.order_id
              ? { ...order, delivery_status: message.new_status }
              : order
          )
        );
        // If the selected order status changes, update it in detail view as well
        if (selectedOrder && selectedOrder.id === message.order_id) {
          setSelectedOrder((prev) => ({
            ...prev,
            delivery_status: message.new_status,
          }));
        }
      } else if (
        message.type === "new_order_assigned" ||
        message.type === "order_available"
      ) {
        // Re-fetch orders to get the latest list, or specifically add the new order if structure allows
        fetchOrders();
      }
      // Add more message types as needed (e.g., 'location_request' if server requests location)
    };

    wsRef.current.onerror = (err) => {
      console.error("WebSocket error:", err);
      // setError('WebSocket connection error. Real-time updates may be affected.');
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected.");
      // Implement reconnect logic if necessary
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user, websocketUrl, fetchOrders, selectedOrder]); // Reconnect if user or websocketUrl changes

  // Location Tracking
  const sendLocationUpdate = useCallback(
    async (lat, lon, orderId = null) => {
      if (!user || !user.token) {
        console.warn("Cannot send location: User not authenticated.");
        return;
      }

      try {
        const response = await fetch(`${apiRoot}foodime/v1/delivery-location`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-WP-Nonce": user.token,
          },
          body: JSON.stringify({
            latitude: lat,
            longitude: lon,
            order_id: orderId, // Pass the current active order ID if any
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(
            "Failed to send location:",
            errorData.message || "Unknown error"
          );
        } else {
          console.log(
            `Location sent: Lat ${lat}, Lon ${lon}` +
              (orderId ? ` for Order ${orderId}` : "")
          );
        }
      } catch (err) {
        console.error("Network error sending location:", err);
      }
    },
    [user, apiRoot]
  );

  // Start/Stop location updates
  useEffect(() => {
    if (!user) return;

    // Check for Geolocation API support
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by your browser.");
      setError("Geolocation not supported. Location tracking unavailable.");
      return;
    }

    // Request permission and start tracking
    const startLocationTracking = () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current); // Clear any existing interval
      }

      locationIntervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            sendLocationUpdate(
              position.coords.latitude,
              position.coords.longitude,
              selectedOrder ? selectedOrder.id : null // Send selected order ID if available
            );
          },
          (posError) => {
            console.error("Geolocation error:", posError);
            // setError(`Geolocation error: ${posError.message}. Location tracking paused.`);
            // Optionally stop interval on consistent error
            // clearInterval(locationIntervalRef.current);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000, // 5 seconds
            maximumAge: 0,
          }
        );
      }, 15000); // Send location every 15 seconds
    };

    // Start tracking immediately if permissions are granted
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted") {
        startLocationTracking();
      } else if (result.state === "prompt") {
        // Prompt user to grant permission
        navigator.geolocation.getCurrentPosition(
          () => {
            console.log("Geolocation permission granted.");
            startLocationTracking();
          },
          (err) => {
            console.warn("Geolocation permission denied initially:", err);
            setError(
              "Geolocation permission denied. Location tracking is essential for delivery. Please enable it in browser settings."
            );
          }
        );
      } else if (result.state === "denied") {
        setError(
          "Geolocation permission denied. Location tracking is essential for delivery. Please enable it in browser settings."
        );
      }
    });

    // Cleanup interval on component unmount
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [user, sendLocationUpdate, selectedOrder]);

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!user || !user.token) {
      setError("Authentication token missing. Please log in again.");
      return;
    }
    setLoading(true); // Show loading feedback for the action
    try {
      const response = await fetch(
        `${apiRoot}foodime/v1/delivery-order-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-WP-Nonce": user.token,
          },
          body: JSON.stringify({ order_id: orderId, status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order status.");
      }

      if (data.success) {
        console.log(`Order ${orderId} status updated to ${newStatus}`);
        // Update the order in the local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, delivery_status: newStatus }
              : order
          )
        );
        // Also update the selected order if it's the one being modified
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, delivery_status: newStatus }));
        }
        setError(null); // Clear any previous errors
      } else {
        setError(data.message || "Failed to update order status.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.message || "Network error while updating status.");
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("foodimeDeliveryUser");
    if (wsRef.current) {
      wsRef.current.close(); // Close WebSocket connection on logout
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current); // Stop location tracking
    }
    navigate("/delivery-login");
  };

  if (!user) {
    return (
      <div className="delivery-panel-container loading-screen">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="delivery-panel-container loading-screen">
        <p>Loading orders...</p>
        {error && <p className="error-message">{error}</p>}
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="delivery-panel-container error-screen">
        <p className="error-message">Error: {error}</p>
        <button onClick={fetchOrders} className="retry-button">
          Retry Fetching Orders
        </button>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    );
  }

  // Filter orders based on status for different sections
  const newOrders = orders.filter(
    (order) => order.delivery_status === "assigned"
  );
  const activeOrders = orders.filter(
    (order) =>
      order.delivery_status === "picked-up" ||
      order.delivery_status === "on-the-way"
  );
  const completedOrders = orders.filter(
    (order) => order.delivery_status === "delivered"
  );

  return (
    <div className="delivery-panel-container">
      <header className="panel-header">
        <h1>Foodime Delivery Partner Panel</h1>
        <div className="user-info">
          <span>Welcome, {user.username || user.full_name}!</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      {error && <p className="error-message top-error">{error}</p>}

      {selectedOrder ? (
        // Order Detail View
        <div className="order-detail-view">
          <button
            onClick={() => setSelectedOrder(null)}
            className="back-button"
          >
            &larr; Back to Orders
          </button>
          <h2>Order #{selectedOrder.order_number} Details</h2>
          <div className="detail-section">
            <h3>Customer Information</h3>
            <p>
              <strong>Name:</strong> {selectedOrder.customer_name}
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              <a href={`tel:${selectedOrder.customer_phone}`}>
                {selectedOrder.customer_phone}
              </a>
            </p>
            <p>
              <strong>Address:</strong>{" "}
              {selectedOrder.customer_address.address_1},{" "}
              {selectedOrder.customer_address.address_2
                ? `${selectedOrder.customer_address.address_2}, `
                : ""}
              {selectedOrder.customer_address.city},{" "}
              {selectedOrder.customer_address.state} -{" "}
              {selectedOrder.customer_address.postcode}
            </p>
            {selectedOrder.customer_address.latitude &&
              selectedOrder.customer_address.longitude && (
                <p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.customer_address.latitude},${selectedOrder.customer_address.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    View on Map (Customer)
                  </a>
                </p>
              )}
            {selectedOrder.customer_notes && (
              <p>
                <strong>Notes:</strong> {selectedOrder.customer_notes}
              </p>
            )}
          </div>

          <div className="detail-section">
            <h3>Restaurant Information</h3>
            <p>
              <strong>Name:</strong> {selectedOrder.restaurant.name}
            </p>
            <p>
              <strong>Address:</strong> {selectedOrder.restaurant.address}
            </p>
            {selectedOrder.restaurant.latitude &&
              selectedOrder.restaurant.longitude && (
                <p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.restaurant.latitude},${selectedOrder.restaurant.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    View on Map (Restaurant)
                  </a>
                </p>
              )}
          </div>

          <div className="detail-section">
            <h3>Order Summary</h3>
            <p>
              <strong>Order Total:</strong> ₹{selectedOrder.total}
            </p>
            <p>
              <strong>Payment Method:</strong> {selectedOrder.payment_method}
            </p>
            <p>
              <strong>Current Status:</strong>{" "}
              <span
                className={`status-badge status-${selectedOrder.delivery_status}`}
              >
                {selectedOrder.delivery_status.replace(/-/g, " ")}
              </span>
            </p>
            <h4>Items:</h4>
            <ul>
              {selectedOrder.order_items.map((item, index) => (
                <li key={index}>
                  {item.name} x {item.quantity} (₹{item.total})
                </li>
              ))}
            </ul>
          </div>

          <div className="status-actions">
            {selectedOrder.delivery_status === "assigned" && (
              <button
                onClick={() =>
                  handleStatusUpdate(selectedOrder.id, "picked-up")
                }
                className="action-button pick-up"
                disabled={loading}
              >
                {loading ? "Updating..." : "Picked Up"}
              </button>
            )}
            {selectedOrder.delivery_status === "picked-up" && (
              <button
                onClick={() =>
                  handleStatusUpdate(selectedOrder.id, "on-the-way")
                }
                className="action-button on-the-way"
                disabled={loading}
              >
                {loading ? "Updating..." : "On The Way"}
              </button>
            )}
            {selectedOrder.delivery_status === "on-the-way" && (
              <button
                onClick={() =>
                  handleStatusUpdate(selectedOrder.id, "delivered")
                }
                className="action-button delivered"
                disabled={loading}
              >
                {loading ? "Updating..." : "Delivered"}
              </button>
            )}
            {/* Optional: Add buttons for 'delivery-issue' or 'cancel' if allowed from app */}
            {/* <button className="action-button issue-report">Report Issue</button> */}
          </div>
        </div>
      ) : (
        // Order List View
        <div className="order-lists">
          <section className="order-section new-orders">
            <h2>New Orders ({newOrders.length})</h2>
            {newOrders.length === 0 ? (
              <p className="no-orders">
                No new orders available for assignment.
              </p>
            ) : (
              <div className="order-cards-container">
                {newOrders.map((order) => (
                  <div
                    key={order.id}
                    className="order-card"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="order-header">
                      <h3>Order #{order.order_number}</h3>
                      <span
                        className={`status-badge status-${order.delivery_status}`}
                      >
                        {order.delivery_status.replace(/-/g, " ")}
                      </span>
                    </div>
                    <p>
                      <strong>Customer:</strong> {order.customer_name}
                    </p>
                    <p>
                      <strong>Total:</strong> ₹{order.total}
                    </p>
                    <p>
                      <strong>Address:</strong> {order.customer_address.city}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(order.id, "picked-up");
                      }}
                      className="action-button assign-pickup"
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Accept & Pick Up"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="order-section active-orders">
            <h2>Active Deliveries ({activeOrders.length})</h2>
            {activeOrders.length === 0 ? (
              <p className="no-orders">No active deliveries.</p>
            ) : (
              <div className="order-cards-container">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="order-card"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="order-header">
                      <h3>Order #{order.order_number}</h3>
                      <span
                        className={`status-badge status-${order.delivery_status}`}
                      >
                        {order.delivery_status.replace(/-/g, " ")}
                      </span>
                    </div>
                    <p>
                      <strong>Customer:</strong> {order.customer_name}
                    </p>
                    <p>
                      <strong>Total:</strong> ₹{order.total}
                    </p>
                    <p>
                      <strong>Address:</strong> {order.customer_address.city}
                    </p>
                    {order.delivery_status === "picked-up" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(order.id, "on-the-way");
                        }}
                        className="action-button on-the-way"
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "On The Way"}
                      </button>
                    )}
                    {order.delivery_status === "on-the-way" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(order.id, "delivered");
                        }}
                        className="action-button delivered"
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "Delivered"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="order-section completed-orders">
            <h2>Completed Deliveries ({completedOrders.length})</h2>
            {completedOrders.length === 0 ? (
              <p className="no-orders">No completed deliveries yet.</p>
            ) : (
              <div className="order-cards-container">
                {completedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="order-card"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="order-header">
                      <h3>Order #{order.order_number}</h3>
                      <span
                        className={`status-badge status-${order.delivery_status}`}
                      >
                        {order.delivery_status.replace(/-/g, " ")}
                      </span>
                    </div>
                    <p>
                      <strong>Customer:</strong> {order.customer_name}
                    </p>
                    <p>
                      <strong>Total:</strong> ₹{order.total}
                    </p>
                    <p>
                      <strong>Address:</strong> {order.customer_address.city}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default DeliveryPanel;
