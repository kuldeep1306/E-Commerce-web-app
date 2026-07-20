import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product === product._id);
      const price = product.discountPrice > 0 ? product.discountPrice : product.price;
      if (existing) {
        const newQty = Math.min(existing.qty + qty, product.stock);
        toast.success("Cart updated");
        return prev.map((i) =>
          i.product === product._id ? { ...i, qty: newQty } : i
        );
      }
      toast.success("Added to cart");
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          image: product.images?.[0] || "",
          price,
          stock: product.stock,
          qty: Math.min(qty, product.stock),
        },
      ];
    });
  };

  const updateQty = (productId, qty) => {
    setItems((prev) =>
      prev.map((i) => (i.product === productId ? { ...i, qty } : i))
    );
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.product !== productId));
    toast.success("Removed from cart");
  };

  const clearCart = () => setItems([]);

  const itemsPrice = items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const totalQty = items.reduce((acc, i) => acc + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQty, removeFromCart, clearCart, itemsPrice, totalQty }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
