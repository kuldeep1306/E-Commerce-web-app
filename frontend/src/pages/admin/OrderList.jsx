import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = () => {
    setLoading(true);
    api.get("/orders", { params: { status: filter, page, limit: 15 } })
      .then(({ data }) => { setOrders(data.orders); setPages(data.pages); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, page]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success("Order status updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl text-ink-900">Orders</h1>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input !w-auto text-sm">
          <option value="all">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-100">
                <tr className="text-left text-ink-500">
                  <th className="p-3 font-medium">Order</th>
                  <th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Total</th>
                  <th className="p-3 font-medium">Paid</th>
                  <th className="p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-t border-ink-100">
                    <td className="p-3 font-medium text-ink-900">#{o._id.slice(-6).toUpperCase()}</td>
                    <td className="p-3 text-ink-700">
                      <p>{o.user?.name}</p>
                      <p className="text-xs text-ink-500">{o.user?.email}</p>
                    </td>
                    <td className="p-3 text-ink-700 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="p-3 text-ink-900 font-medium">₹{o.totalPrice.toLocaleString("en-IN")}</td>
                    <td className="p-3">
                      <span className={`badge ${o.isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{o.isPaid ? "Paid" : "Unpaid"}</span>
                    </td>
                    <td className="p-3">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 ${statusColor[o.orderStatus]}`}
                      >
                        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`h-9 w-9 rounded-lg text-sm font-medium ${p === page ? "bg-primary-500 text-white" : "bg-white border border-ink-300"}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
