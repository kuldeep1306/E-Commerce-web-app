import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import { resolveImageUrl } from "../../utils/imageUrl.js";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = () => {
    setLoading(true);
    api.get("/products", { params: { page, limit: 10 } })
      .then(({ data }) => { setProducts(data.products); setPages(data.pages); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete product");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-ink-900">Products</h1>
        <Link to="/admin/products/new" className="btn-primary">+ Add product</Link>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-100">
                <tr className="text-left text-ink-500">
                  <th className="p-3 font-medium">Product</th>
                  <th className="p-3 font-medium">Category</th>
                  <th className="p-3 font-medium">Price</th>
                  <th className="p-3 font-medium">Stock</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-t border-ink-100">
                    <td className="p-3 flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-lg bg-ink-100 overflow-hidden shrink-0">
                        {p.images?.[0] && <img src={resolveImageUrl(p.images[0])} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <span className="font-medium text-ink-900 line-clamp-1">{p.name}</span>
                    </td>
                    <td className="p-3 text-ink-700">{p.category}</td>
                    <td className="p-3 text-ink-900 font-medium">₹{p.price.toLocaleString("en-IN")}</td>
                    <td className="p-3">
                      <span className={p.stock <= 5 ? "text-red-600 font-medium" : "text-ink-700"}>{p.stock}</span>
                    </td>
                    <td className="p-3">
                      <span className={`badge ${p.isActive ? "bg-green-100 text-green-700" : "bg-ink-100 text-ink-500"}`}>
                        {p.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <Link to={`/admin/products/${p._id}/edit`} className="text-primary-600 font-medium">Edit</Link>
                      <button onClick={() => handleDelete(p._id)} className="text-red-600 font-medium">Delete</button>
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
