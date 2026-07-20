import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

const statCards = (stats) => [
  { label: "Total sales", value: `₹${stats.totalSales.toLocaleString("en-IN")}`, color: "bg-primary-500" },
  { label: "Total orders", value: stats.totalOrders, color: "bg-accent-500" },
  { label: "Total products", value: stats.totalProducts, color: "bg-blue-500" },
  { label: "Total customers", value: stats.totalUsers, color: "bg-purple-500" },
];

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data.stats));
  }, []);

  if (!stats) return <Loader full />;

  const maxSale = Math.max(...stats.salesByDay.map((d) => d.total), 1);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-ink-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards(stats).map((c) => (
          <div key={c.label} className="card p-4">
            <div className={`h-2 w-10 rounded-full ${c.color} mb-3`} />
            <p className="text-2xl font-bold text-ink-900">{c.value}</p>
            <p className="text-xs text-ink-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-ink-900 mb-4">Sales — last 7 days</h2>
          <div className="flex items-end gap-2 h-40">
            {stats.salesByDay.length === 0 && <p className="text-sm text-ink-500 self-center">No sales yet</p>}
            {stats.salesByDay.map((d) => (
              <div key={d._id} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary-500 rounded-t-md"
                  style={{ height: `${Math.max((d.total / maxSale) * 100, 4)}%` }}
                  title={`₹${d.total}`}
                />
                <span className="text-[10px] text-ink-500">{d._id.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Low stock alert</h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-sm text-ink-500">All products well stocked.</p>
          ) : (
            <div className="space-y-2">
              {stats.lowStockProducts.map((p) => (
                <div key={p._id} className="flex justify-between text-sm">
                  <span className="text-ink-700 truncate pr-2">{p.name}</span>
                  <span className="text-red-600 font-medium shrink-0">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-ink-900">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary-600 font-medium">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-500 border-b border-ink-100">
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o._id} className="border-b border-ink-100 last:border-0">
                  <td className="py-2.5">
                    <Link to={`/admin/orders`} className="text-primary-600 font-medium">#{o._id.slice(-6).toUpperCase()}</Link>
                  </td>
                  <td className="py-2.5 text-ink-700">{o.user?.name || "Guest"}</td>
                  <td className="py-2.5 text-ink-900 font-medium">₹{o.totalPrice.toLocaleString("en-IN")}</td>
                  <td className="py-2.5"><span className={`badge ${statusColor[o.orderStatus]}`}>{o.orderStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
