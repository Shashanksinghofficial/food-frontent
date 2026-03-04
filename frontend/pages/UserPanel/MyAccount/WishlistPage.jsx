import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WishlistPage.css";

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlistProducts = async () => {
    const token = localStorage.getItem("jwtToken");
    const wishlistIds = JSON.parse(localStorage.getItem("wishlist")) || [];

    if (!wishlistIds.length) {
      setWishlistProducts([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5206/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const allProducts = await res.json();

      const filtered = allProducts.filter((p) => wishlistIds.includes(p.id));

      setWishlistProducts(filtered);
    } catch (err) {
      console.log("Wishlist load error", err);
    }

    setLoading(false);
  };

  const removeFromWishlist = (id) => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const updated = wishlist.filter((item) => item !== id);

    localStorage.setItem("wishlist", JSON.stringify(updated));

    setWishlistProducts((prev) => prev.filter((product) => product.id !== id));
  };

  useEffect(() => {
    loadWishlistProducts();
  }, []);

  if (loading) return <h2 className="center">Loading Wishlist...</h2>;

  return (
    <div className="wishlist-container">
      <h1>My Wishlist ❤️</h1>

      {wishlistProducts.length === 0 ? (
        <div className="empty-box">
          <h3>No items in wishlist</h3>
          <button className="primary-btn" onClick={() => navigate("/homepage")}>
            Go to Shop →
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistProducts.map((product) => (
            <div key={product.id} className="wishlist-card">
              <img
                src={
                  product.imageUrl?.startsWith("http")
                    ? product.imageUrl
                    : `http://localhost:5206${product.imageUrl}`
                }
                alt={product.name}
                onClick={() => navigate(`/product/${product.id}`)}
              />

              <h3>{product.name}</h3>
              <p>₹{product.price}</p>

              <div className="wishlist-actions">
                <button
                  className="view-btn"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  View
                </button>

                <button
                  className="remove-btn"
                  onClick={() => removeFromWishlist(product.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
