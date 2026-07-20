import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "../../components/Loader.jsx";

export default function UserList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/admin/users").then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (u) => {
    try {
      await api.put(`/admin/users/${u._id}`, { isActive: !u.isActive });
      toast.success(u.isActive ? "User deactivated" : "User activated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update user");
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete account for ${u.name}?`)) return;
    try {
      await api.delete(`/admin/users/${u._id}`);
      toast.success("User deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete user");
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-ink-900 mb-6">Users</h1>
      <div className="card overflow-hidden">
        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-100">
                <tr className="text-left text-ink-500">
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Role</th>
                  <th className="p-3 font-medium">Joined</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-ink-100">
                    <td className="p-3 font-medium text-ink-900">{u.name}</td>
                    <td className="p-3 text-ink-700">{u.email}</td>
                    <td className="p-3">
                      <span className={`badge ${u.role === "admin" ? "bg-primary-100 text-primary-700" : "bg-ink-100 text-ink-700"}`}>{u.role}</span>
                    </td>
                    <td className="p-3 text-ink-700 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="p-3">
                      <span className={`badge ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{u.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      {u.role !== "admin" && (
                        <>
                          <button onClick={() => toggleActive(u)} className="text-primary-600 font-medium">{u.isActive ? "Deactivate" : "Activate"}</button>
                          <button onClick={() => handleDelete(u)} className="text-red-600 font-medium">Delete</button>
                        </>
                      )}
                      {u.role === "admin" && u._id === currentUser?._id && <span className="text-xs text-ink-500">You</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
