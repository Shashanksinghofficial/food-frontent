import { createContext, useState, useEffect } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("foodimeCart");
    return saved ? JSON.parse(saved) : {};
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("foodimeOrders");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("foodimeCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("foodimeOrders", JSON.stringify(orders));
  }, [orders]);

  const addToCart = (product) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: {
        ...product,
        quantity: (prev[product.id]?.quantity || 0) + 1,
      },
    }));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      if (!prev[productId]) return prev;
      const updated = { ...prev };
      updated[productId] = {
        ...updated[productId],
        quantity: updated[productId].quantity - 1,
      };
      if (updated[productId].quantity <= 0) delete updated[productId];
      return updated;
    });
  };

  const deleteFromCart = (productId) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  const clearCart = () => setCart({});

  const getCartItems = () => Object.values(cart);

  const getCartTotal = () =>
    Object.values(cart).reduce(
      (sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity,
      0
    );

  const getCartCount = () =>
    Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  const placeOrder = (orderDetails) => {
    const newOrder = {
      id: Date.now(),
      order_number: `FDM-${Date.now().toString().slice(-6)}`,
      items: getCartItems(),
      total: getCartTotal(),
      status: "confirmed",
      date: new Date().toISOString(),
      ...orderDetails,
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        deleteFromCart,
        clearCart,
        getCartItems,
        getCartTotal,
        getCartCount,
        wishlist,
        toggleWishlist,
        isInWishlist,
        orders,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
