import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { resolveImageUrl } from "../utils/imageUrl.js";

export default function Cart() {
  const { items, updateQty, removeFromCart, itemsPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-lg font-medium text-ink-900">Your cart is empty</p>
        <p className="text-sm text-ink-500 mt-1">Browse products and add items to get started.</p>
        <Link to="/" className="btn-primary mt-5 inline-flex">Continue shopping</Link>
      </div>
    );
  }

  const shipping = itemsPrice > 999 ? 0 : 49;
  const tax = Math.round(itemsPrice * 0.18 * 100) / 100;
  const total = Math.round((itemsPrice + shipping + tax) * 100) / 100;

  return (
    <div className="container-app py-6">
      <h1 className="font-display font-bold text-2xl text-ink-900 mb-6">Your cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.product} className="card p-3 flex gap-3 items-center">
              <div className="h-20 w-20 rounded-lg bg-ink-100 overflow-hidden shrink-0">
                {item.image ? <img src={resolveImageUrl(item.image)} alt={item.name} className="h-full w-full object-cover" /> : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-ink-900 truncate">{item.name}</p>
                <p className="text-sm text-ink-500 mt-0.5">₹{item.price.toLocaleString("en-IN")}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center border border-ink-300 rounded-lg">
                    <button onClick={() => updateQty(item.product, Math.max(1, item.qty - 1))} className="px-2.5 py-1 text-sm">−</button>
                    <span className="px-3 text-sm font-medium">{item.qty}</span>
                    <button onClick={() => updateQty(item.product, Math.min(item.stock, item.qty + 1))} className="px-2.5 py-1 text-sm">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.product)} className="text-xs text-red-600 font-medium ml-2">Remove</button>
                </div>
              </div>
              <p className="font-semibold text-ink-900 shrink-0">₹{(item.price * item.qty).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>

        <div className="card p-5 h-fit">
          <h2 className="font-display font-bold text-ink-900 mb-4">Order summary</h2>
          <div className="space-y-2 text-sm text-ink-700">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{itemsPrice.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
            <div className="flex justify-between"><span>Tax (18% GST)</span><span>₹{tax.toLocaleString("en-IN")}</span></div>
            <div className="border-t border-ink-100 pt-2 flex justify-between font-bold text-ink-900 text-base">
              <span>Total</span><span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <button onClick={() => navigate("/checkout")} className="btn-primary w-full mt-5">Proceed to checkout</button>
        </div>
      </div>
    </div>
  );
}
