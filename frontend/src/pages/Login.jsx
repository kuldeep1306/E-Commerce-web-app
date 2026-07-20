import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate(location.state?.from?.pathname || (user.role === "admin" ? "/admin" : "/"));
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-12 max-w-md mx-auto">
      <div className="card p-7">
        <h1 className="font-display font-bold text-2xl text-ink-900 text-center">Welcome back</h1>
        <p className="text-sm text-ink-500 text-center mt-1">Sign in to continue shopping</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Email address</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" placeholder="••••••••" />
          </div>
          <button disabled={loading} className="btn-primary w-full">{loading ? "Signing in..." : "Sign in"}</button>
        </form>
        <p className="text-sm text-center text-ink-500 mt-5">
          New here? <Link to="/register" className="text-primary-600 font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
