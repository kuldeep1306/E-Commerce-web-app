import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/myorders").then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-app py-6">
      <h1 className="font-display font-bold text-2xl text-ink-900 mb-1">My orders</h1>
      <p className="text-sm text-ink-500 mb-6">Signed in as {user?.email}</p>

      {loading ? (
        <Loader />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-ink-500">
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="btn-primary mt-4 inline-flex">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link to={`/order/${o._id}`} key={o._id} className="card p-4 flex items-center justify-between hover:shadow-cardHover transition-shadow">
              <div>
                <p className="font-medium text-ink-900 text-sm">Order #{o._id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-ink-500 mt-0.5">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {o.orderItems.length} item(s)</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-ink-900">₹{o.totalPrice.toLocaleString("en-IN")}</p>
                <span className={`badge mt-1 ${statusColor[o.orderStatus]}`}>{o.orderStatus}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
