import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  Search,
  Heart,
  CheckCircle,
  Filter,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./ShopPage.css";

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [toastQueue, setToastQueue] = useState([]);
  const [categories, setCategories] = useState([{ name: "All", slug: "all" }]);
  const [cartToast, setCartToast] = useState({ show: false, message: "" });

  // 🔹 Filter States
  const [filterModal, setFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    price: [0, 500],
    rating: [],
  });
  const [availableRatings] = useState([5, 4, 3, 2, 1]);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const jwtToken = localStorage.getItem("jwtToken");

  const activeCategoryFromURL = searchParams.get("category") || "all";
  const [activeCategory, setActiveCategory] = useState(activeCategoryFromURL);

  useEffect(() => {
    if (activeCategory === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", activeCategory);
    }
    setSearchParams(searchParams);
  }, [activeCategory, searchParams, setSearchParams]);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (!jwtToken) return;

    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "http://localhost/foodime/wp-json/foodime/v1/categories",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch categories");

        const data = await res.json();
        const catData = data.map((c) => ({
          name: c.name.trim(),
          slug: c.slug,
        }));
        setCategories([{ name: "All", slug: "all" }, ...catData]);
      } catch (err) {
        console.error("Category fetch error:", err);
      }
    };

    fetchCategories();
  }, [jwtToken]);

  useEffect(() => {
    if (!jwtToken) {
      setError("Missing JWT Token. Please login again.");
      setLoading(false);
      navigate("/login");
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = "http://localhost/foodime/wp-json/foodime/v1/products";
        if (activeCategory && activeCategory !== "all") {
          url += `?category=${activeCategory}`;
        }

        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401 || res.status === 403) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("jwtToken");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [jwtToken, navigate, activeCategory]);

  const toggleWishlist = (product) => {
    if (wishlist.includes(product.id)) {
      setWishlist(wishlist.filter((id) => id !== product.id));
      showToast(`${product.name} removed from wishlist`);
    } else {
      setWishlist([...wishlist, product.id]);
      showToast(`${product.name} added to wishlist`);
    }
  };

  const showToast = (msg, type = "black") => {
    const id = Date.now();
    setToastQueue((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToastQueue((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  };

  const showCartSummary = (message) => {
    setCartToast({ show: true, message });
    setTimeout(() => setCartToast({ show: false, message: "" }), 7000);
  };

  const addToCart = (product) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }));
    showCartSummary(`${product.name} added to cart`);
  };

  const removeFromCart = (product) => {
    setCart((prev) => {
      if (!prev[product.id]) return prev;
      const updated = { ...prev };
      updated[product.id] -= 1;
      if (updated[product.id] <= 0) delete updated[product.id];
      return updated;
    });
    showCartSummary(`${product.name} removed from cart`);
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  if (loading)
    return (
      <div className="shop-loading">
        <div className="spinner"></div>
        <span>Loading products...</span>
      </div>
    );

  if (error) return <div className="shop-error">{error}</div>;

  return (
    <div className="shop-page">
      {/* 🔹 Search + Filter button */}
      <motion.div
        className="search-bar"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Search size={20} />
        <input
          type="text"
          placeholder="Search for food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className={`filter-btn ${
            selectedFilters.rating.length > 0 ||
            selectedFilters.price[0] !== 0 ||
            selectedFilters.price[1] !== 500
              ? "active"
              : ""
          }`}
          onClick={() => setFilterModal(true)}
        >
          <Filter size={20} />
        </button>
      </motion.div>

      {/* Categories filter */}
      <div className="categories-filter">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            className={`category-btn ${
              activeCategory === cat.slug ? "active" : ""
            }`}
            onClick={() => setActiveCategory(cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <h1 className="shop-title">🍔 Our Menu</h1>

      {/* Products grid */}
      <div className="products-grid">
        <AnimatePresence>
          {products
            // 🔹 Search filter
            .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

            // 🔹 Price filter
            .filter((p) => {
              const price = parseFloat(p.price) || 0;
              return (
                price >= selectedFilters.price[0] &&
                price <= selectedFilters.price[1]
              );
            })

            // 🔹 Rating filter
            .filter((p) => {
              if (selectedFilters.rating.length === 0) return true; // agar koi rating select hi nhi hai
              const avgRating = parseFloat(p.average_rating) || 0;
              return selectedFilters.rating.some(
                (r) => Math.floor(avgRating) === r
              );
            })

            // 🔹 Render
            .map((product) => (
              <motion.div
                key={product.id}
                className="product-card"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={() => navigate(`/product/${product.id}`)} // ← Yaha add kiya
              >
                {product.images && product.images.length > 0 && (
                  <motion.img
                    src={product.images[0].src}
                    alt={product.name}
                    className="product-image"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                <button
                  className={`wishlist-btn ${
                    wishlist.includes(product.id) ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation(); // card click ko rokta hai
                    toggleWishlist(product);
                  }}
                >
                  <Heart
                    size={22}
                    fill={wishlist.includes(product.id) ? "red" : "white"}
                    color={wishlist.includes(product.id) ? "red" : "black"}
                  />
                </button>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">₹{product.price || "N/A"}</p>

                  <div className="cart-actions">
                    {cart[product.id] ? (
                      <motion.div
                        className="quantity-controls"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // card click ko rokta hai
                            removeFromCart(product);
                          }}
                        >
                          <Minus size={18} />
                        </button>
                        <span>{cart[product.id]}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // card click ko rokta hai
                            addToCart(product);
                          }}
                        >
                          <Plus size={18} />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        className="add-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // card click ko rokta hai
                          addToCart(product);
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        Add
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* 🔹 Filter Modal */}
      <AnimatePresence>
        {filterModal && (
          <motion.div
            className="filter-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="filter-modal"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
            >
              <div className="filter-header">
                <h2>Filters</h2>
                <button onClick={() => setFilterModal(false)}>
                  <X size={20} />
                </button>
              </div>

              {/* Price Range */}
              <div className="filter-section">
                <h4>Price Range</h4>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={selectedFilters.price[0]}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value <= selectedFilters.price[1] - 10) {
                      setSelectedFilters((prev) => ({
                        ...prev,
                        price: [value, prev.price[1]],
                      }));
                    }
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={selectedFilters.price[1]}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= selectedFilters.price[0] + 10) {
                      setSelectedFilters((prev) => ({
                        ...prev,
                        price: [prev.price[0], value],
                      }));
                    }
                  }}
                />
                <div>
                  ₹{selectedFilters.price[0]} - ₹{selectedFilters.price[1]}
                </div>
              </div>

              {/* Ratings */}
              <div className="filter-section">
                <h4>Ratings</h4>
                {availableRatings.map((r) => (
                  <label key={r}>
                    <input
                      type="checkbox"
                      checked={selectedFilters.rating.includes(r)}
                      onChange={() =>
                        setSelectedFilters((prev) => {
                          const rating = prev.rating.includes(r)
                            ? prev.rating.filter((x) => x !== r)
                            : [...prev.rating, r];
                          return { ...prev, rating };
                        })
                      }
                    />
                    {"★".repeat(r)}
                  </label>
                ))}
              </div>

              {/* Buttons */}
              <div className="filter-actions">
                <button
                  className="clear-btn"
                  onClick={() =>
                    setSelectedFilters({
                      price: [0, 500],
                      rating: [],
                    })
                  }
                >
                  Clear
                </button>
                <button
                  className="apply-btn"
                  onClick={() => setFilterModal(false)}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart summary as toast */}
      <AnimatePresence>
        {cartToast.show && (
          <motion.div
            className="cart-summary"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ShoppingCart size={20} />
            <span>{cartToast.message}</span>
            <button className="checkout-btn" onClick={() => navigate("/cart")}>
              View Cart
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
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

export default ShopPage;
