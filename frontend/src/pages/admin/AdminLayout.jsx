import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navItems = [
  { to: "/admin", label: "Dashboard", end: true, icon: "M3 12l9-9 9 9M4 10v10h16V10" },
  { to: "/admin/products", label: "Products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { to: "/admin/orders", label: "Orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { to: "/admin/users", label: "Users", icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-1.13a4 4 0 10-6 0m6 0a4 4 0 11-6 0M9 7a4 4 0 118 0 4 4 0 01-8 0z" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-ink-100">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-primary-800 text-white shrink-0">
        <div className="h-16 flex items-center px-6 font-display font-bold text-lg border-b border-white/10">
          Shopwave <span className="text-accent-400 ml-1">Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? "bg-white/10 text-white" : "text-primary-100 hover:bg-white/5"
                }`
              }
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link to="/" className="text-xs text-primary-100 hover:text-white">← Back to store</Link>
          <button onClick={logout} className="block mt-2 text-xs text-red-300 hover:text-red-200">Sign out</button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar - mobile */}
        <div className="lg:hidden h-14 bg-primary-800 text-white flex items-center justify-between px-4 sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="p-1">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-display font-bold">Admin</span>
          <span className="text-xs text-primary-100">{user?.name?.split(" ")[0]}</span>
        </div>

        {open && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="w-64 bg-primary-800 text-white h-full p-4">
              <div className="flex justify-between items-center mb-6">
                <span className="font-display font-bold">Menu</span>
                <button onClick={() => setOpen(false)}>✕</button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? "bg-white/10" : "text-primary-100"}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <Link to="/" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-primary-100">← Back to store</Link>
                <button onClick={logout} className="block px-3 py-2.5 text-sm text-red-300">Sign out</button>
              </nav>
            </div>
            <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
