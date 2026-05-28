import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, ShoppingCart, Trash2 } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../../context/useCart";
import "./Wishlist.css";

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const jwtToken = localStorage.getItem("jwtToken");

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      if (jwtToken) {
        try {
          const res = await fetch(
            "http://localhost/foodime/wp-json/foodime/v1/products",
            {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            setWishlistProducts(
              data.filter((p) => wishlist.includes(p.id))
            );
            setLoading(false);
            return;
          }
        } catch {
          console.log("API unavailable, using mock data");
        }
      }

      const mockProducts = wishlist.map((id) => ({
        id,
        name: `Wishlist Item #${id}`,
        price: (Math.random() * 300 + 50).toFixed(0),
        images: [],
        average_rating: (Math.random() * 2 + 3).toFixed(1),
      }));
      setWishlistProducts(mockProducts);
      setLoading(false);
    };

    fetchWishlistProducts();
  }, [wishlist, jwtToken]);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-loading">
          <div className="spinner"></div>
          <span>Loading wishlist...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1>
          <Heart size={22} fill="#ff4444" color="#ff4444" /> My Wishlist
        </h1>
        <span className="wishlist-count">{wishlist.length} items</span>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="empty-wishlist">
          <Heart size={48} />
          <h2>Your wishlist is empty</h2>
          <p>Save your favorite items here for quick access</p>
          <button onClick={() => navigate("/homepage")}>Browse Menu</button>
        </div>
      ) : (
        <div className="wishlist-grid">
          <AnimatePresence>
            {wishlistProducts.map((product) => (
              <motion.div
                key={product.id}
                className="wishlist-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].src}
                    alt={product.name}
                    className="wishlist-image"
                  />
                ) : (
                  <div className="wishlist-image placeholder">
                    <Heart size={24} />
                  </div>
                )}
                <div className="wishlist-info">
                  <h3>{product.name}</h3>
                  <p className="wishlist-price">
                    {"\u20B9"}
                    {product.price}
                  </p>
                  {product.average_rating && (
                    <span className="wishlist-rating">
                      {"*"} {product.average_rating}
                    </span>
                  )}
                </div>
                <div className="wishlist-actions">
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart size={16} />
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => toggleWishlist(product.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
