import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const emptyAddress = { fullName: "", phone: "", street: "", city: "", state: "", postalCode: "", country: "India" };

export default function Checkout() {
  const { items, itemsPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ ...emptyAddress, fullName: user?.name || "" });
  const [placing, setPlacing] = useState(false);

  const shipping = itemsPrice > 999 ? 0 : 49;
  const tax = Math.round(itemsPrice * 0.18 * 100) / 100;
  const total = Math.round((itemsPrice + shipping + tax) * 100) / 100;

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setPlacing(true);
    try {
      // 1. Create order in our DB
      const { data: orderData } = await api.post("/orders", {
        orderItems: items,
        shippingAddress: address,
        paymentMethod: "Razorpay",
      });
      const order = orderData.order;

      // 2. Create Razorpay order
      const { data: payData } = await api.post("/payment/create-order", { orderId: order._id });

      // 3. Open Razorpay checkout
      const options = {
        key: payData.key,
        amount: payData.amount,
        currency: "INR",
        name: "Shopwave",
        description: `Order #${order._id.slice(-8).toUpperCase()}`,
        order_id: payData.razorpayOrder.id,
        prefill: {
          name: address.fullName,
          contact: address.phone,
          email: user?.email || "",
        },
        theme: { color: "#0F766E" },
        handler: async function (response) {
          try {
            await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });
            clearCart();
            toast.success("Payment successful!");
            navigate(`/order/${order._id}`);
          } catch (err) {
            toast.error("Payment verification failed. Contact support if amount was deducted.");
          }
        },
        modal: {
          ondismiss: function () {
            toast("Payment cancelled. Your order is saved as pending.", { icon: "ℹ️" });
            navigate(`/order/${order._id}`);
          },
        },
      };

      if (!window.Razorpay) {
        toast.error("Payment gateway failed to load. Check your internet connection.");
        setPlacing(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return <div className="container-app py-20 text-center text-ink-500">Your cart is empty.</div>;
  }

  return (
    <div className="container-app py-6">
      <h1 className="font-display font-bold text-2xl text-ink-900 mb-6">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={placeOrder} className="lg:col-span-2 card p-5 space-y-4">
          <h2 className="font-display font-bold text-ink-900">Shipping address</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input required name="fullName" value={address.fullName} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Phone number</label>
              <input required name="phone" value={address.phone} onChange={handleChange} className="input" pattern="[0-9]{10}" title="10 digit phone number" />
            </div>
          </div>
          <div>
            <label className="label">Street address</label>
            <input required name="street" value={address.street} onChange={handleChange} className="input" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">City</label>
              <input required name="city" value={address.city} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">State</label>
              <input required name="state" value={address.state} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Postal code</label>
              <input required name="postalCode" value={address.postalCode} onChange={handleChange} className="input" pattern="[0-9]{6}" title="6 digit postal code" />
            </div>
          </div>
          <button disabled={placing} className="btn-primary w-full sm:w-auto">
            {placing ? "Placing order..." : `Pay ₹${total.toLocaleString("en-IN")} with Razorpay`}
          </button>
        </form>

        <div className="card p-5 h-fit">
          <h2 className="font-display font-bold text-ink-900 mb-4">Order summary</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto mb-3 pr-1">
            {items.map((i) => (
              <div key={i.product} className="flex justify-between text-sm text-ink-700">
                <span className="truncate pr-2">{i.name} × {i.qty}</span>
                <span className="shrink-0">₹{(i.price * i.qty).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-ink-100 pt-3 space-y-2 text-sm text-ink-700">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{itemsPrice.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
            <div className="flex justify-between"><span>Tax (18% GST)</span><span>₹{tax.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between font-bold text-ink-900 text-base"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
