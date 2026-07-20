import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalQty } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/?keyword=${encodeURIComponent(query.trim())}` : "/");
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-ink-100 shadow-sm">
      <div className="container-app flex items-center gap-4 h-16">
        <Link to="/" className="flex items-center gap-1.5 shrink-0">
          <span className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-display font-bold text-lg">S</span>
          <span className="font-display font-bold text-lg text-ink-900 hidden sm:block">Shopwave</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products..."
            className="input rounded-r-none"
          />
          <button className="btn-primary rounded-l-none px-4">Search</button>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link to="/cart" className="relative btn-outline !px-3 !py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {totalQty > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-accent-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalQty}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="btn-outline !px-3 !py-2"
              >
                <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 card p-1.5 border border-ink-100"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-ink-700 hover:bg-ink-100">My orders</Link>
                  {user.role === "admin" && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-ink-700 hover:bg-ink-100">Admin panel</Link>
                  )}
                  <button
                    onClick={() => { logout(); setMenuOpen(false); navigate("/"); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary !px-4 !py-2">Sign in</Link>
          )}
        </div>
      </div>
      <form onSubmit={handleSearch} className="md:hidden container-app pb-3 flex">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="input rounded-r-none"
        />
        <button className="btn-primary rounded-l-none px-4">Go</button>
      </form>
    </header>
  );
}
