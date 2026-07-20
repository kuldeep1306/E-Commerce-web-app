import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password);
      toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-12 max-w-md mx-auto">
      <div className="card p-7">
        <h1 className="font-display font-bold text-2xl text-ink-900 text-center">Create an account</h1>
        <p className="text-sm text-ink-500 text-center mt-1">Join Shopwave in seconds</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="label">Email address</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" placeholder="At least 6 characters" />
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input required type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="input" />
          </div>
          <button disabled={loading} className="btn-primary w-full">{loading ? "Creating account..." : "Create account"}</button>
        </form>
        <p className="text-sm text-center text-ink-500 mt-5">
          Already have an account? <Link to="/login" className="text-primary-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
