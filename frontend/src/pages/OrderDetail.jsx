import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import { resolveImageUrl } from "../utils/imageUrl.js";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader full />;
  if (!order) return <div className="container-app py-16 text-center text-ink-500">Order not found.</div>;

  return (
    <div className="container-app py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-ink-500">Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
        <span className={`badge ${statusColor[order.orderStatus]}`}>{order.orderStatus}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <h2 className="font-semibold text-sm text-ink-900 mb-2">Shipping address</h2>
          <p className="text-sm text-ink-700">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-ink-700">{order.shippingAddress.street}, {order.shippingAddress.city}</p>
          <p className="text-sm text-ink-700">{order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
          <p className="text-sm text-ink-700 mt-1">Phone: {order.shippingAddress.phone}</p>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold text-sm text-ink-900 mb-2">Payment</h2>
          <p className="text-sm text-ink-700">Method: {order.paymentMethod}</p>
          <p className="text-sm mt-1">
            {order.isPaid ? (
              <span className="text-green-600 font-medium">Paid on {new Date(order.paidAt).toLocaleDateString("en-IN")}</span>
            ) : (
              <span className="text-red-600 font-medium">Not paid</span>
            )}
          </p>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <h2 className="font-semibold text-sm text-ink-900 mb-3">Items</h2>
        <div className="space-y-3">
          {order.orderItems.map((item) => (
            <div key={item.product} className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-lg bg-ink-100 overflow-hidden shrink-0">
                {item.image && <img src={resolveImageUrl(item.image)} alt={item.name} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900 truncate">{item.name}</p>
                <p className="text-xs text-ink-500">Qty: {item.qty} × ₹{item.price.toLocaleString("en-IN")}</p>
              </div>
              <p className="text-sm font-semibold text-ink-900">₹{(item.price * item.qty).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <div className="space-y-2 text-sm text-ink-700">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{order.itemsPrice.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{order.shippingPrice === 0 ? "Free" : `₹${order.shippingPrice}`}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>₹{order.taxPrice.toLocaleString("en-IN")}</span></div>
          <div className="border-t border-ink-100 pt-2 flex justify-between font-bold text-ink-900 text-base"><span>Total</span><span>₹{order.totalPrice.toLocaleString("en-IN")}</span></div>
        </div>
      </div>
    </div>
  );
}
