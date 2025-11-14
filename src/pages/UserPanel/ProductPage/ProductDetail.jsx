import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  Plus,
  Minus,
  MapPin,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import "./ProductDetail.css";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const jwtToken = localStorage.getItem("jwtToken");

  useEffect(() => {
    if (!jwtToken) {
      navigate("/login");
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `http://localhost/foodime/wp-json/foodime/v1/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to load product");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, jwtToken, navigate]);

  if (loading)
    return (
      <div className="product-loading">
        <div className="spinner"></div>
        <span>Loading product...</span>
      </div>
    );

  if (error) return <div className="product-error">{error}</div>;

  const toggleTopping = (topping) => {
    setSelectedToppings((prev) =>
      prev.includes(topping)
        ? prev.filter((t) => t !== topping)
        : [...prev, topping]
    );
  };

  const handleAddToCart = () => {
    alert(`
✅ ${product?.name} Added to Cart!
🍔 Size: ${selectedSize || "Default"}
🍕 Toppings: ${selectedToppings.join(", ") || "None"}
🧾 Quantity: ${quantity}
    `);
  };

  return (
    <motion.div
      className="product-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={22} /> Back
      </button>

      {/* Product Image */}
      <div className="product-hero">
        <motion.img
          src={product?.images?.[0]?.src}
          alt={product?.name}
          className="product-main-image"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Product Details */}
      <div className="product-details">
        <h1 className="product-title">{product?.name}</h1>
        <p className="product-category">
          {product?.categories?.[0]?.name || "Food"}
        </p>

        <div className="product-meta">
          <span className="price">₹{product?.price}</span>
          <span className="rating">
            ⭐ {product?.average_rating || "4.5"} ({product?.review_count || 0})
          </span>
        </div>

        <p className="product-desc">
          {product?.short_description?.replace(/<[^>]+>/g, "") ||
            "Delicious food prepared with fresh ingredients."}
        </p>

        {/* Size Selector */}
        {product?.sizes?.length > 0 && (
          <div className="product-sizes">
            <h4>Select Size</h4>
            <div className="size-options">
              {product.sizes.map((size) => (
                <button
                  key={size.id}
                  className={`size-btn ${
                    selectedSize === size.attributes?.attribute_size
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedSize(size.attributes?.attribute_size)
                  }
                >
                  {size.attributes?.attribute_size || "Default"} – ₹{size.price}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Extra Toppings */}
        {product?.extra_toppings?.length > 0 && (
          <div className="product-toppings">
            <h4>Extra Toppings</h4>
            <div className="topping-list">
              {product.extra_toppings.map((topping, index) => (
                <label key={index} className="topping-item">
                  <input
                    type="checkbox"
                    checked={selectedToppings.includes(topping)}
                    onChange={() => toggleTopping(topping)}
                  />
                  {topping}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="product-quantity">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
            <Minus size={18} />
          </button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)}>
            <Plus size={18} />
          </button>
        </div>

        {/* Add to Cart */}
        <motion.button
          className="add-to-cart-btn"
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
        >
          <ShoppingCart size={20} /> Add to Cart
        </motion.button>

        {/* Vendor Info */}
        {product?.vendor && (
          <div className="vendor-info">
            <h3>About Vendor</h3>
            <p className="vendor-name">{product.vendor.vendor_shop_name}</p>
            <p>
              👤 {product.vendor.vendor_name || "Vendor"} <br />
              <MapPin size={14} /> {product.vendor.vendor_address || "—"}
            </p>
            <p className="vendor-rating">
              <Star size={14} /> Shop Rating:{" "}
              {product.vendor.vendor_rating || "4.5"}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductPage;
