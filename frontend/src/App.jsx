import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import Home from "./pages/Home.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import NotFound from "./pages/NotFound.jsx";

import AdminLayout from "./pages/admin/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import ProductList from "./pages/admin/ProductList.jsx";
import ProductForm from "./pages/admin/ProductForm.jsx";
import OrderList from "./pages/admin/OrderList.jsx";
import UserList from "./pages/admin/UserList.jsx";

// Routes where the store navbar should stay hidden (auth pages)
const NAVBAR_HIDDEN_ROUTES = ["/login", "/register"];

function StoreLayout({ children }) {
  const { pathname } = useLocation();
  const hideNavbar = NAVBAR_HIDDEN_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="users" element={<UserList />} />
      </Route>

      {/* Storefront routes */}
      <Route path="/" element={<StoreLayout><Home /></StoreLayout>} />
      <Route path="/product/:id" element={<StoreLayout><ProductDetail /></StoreLayout>} />
      <Route path="/cart" element={<StoreLayout><Cart /></StoreLayout>} />
      <Route
        path="/checkout"
        element={
          <StoreLayout>
            <ProtectedRoute><Checkout /></ProtectedRoute>
          </StoreLayout>
        }
      />
      <Route path="/login" element={<StoreLayout><Login /></StoreLayout>} />
      <Route path="/register" element={<StoreLayout><Register /></StoreLayout>} />
      <Route
        path="/profile"
        element={
          <StoreLayout>
            <ProtectedRoute><Profile /></ProtectedRoute>
          </StoreLayout>
        }
      />
      <Route
        path="/order/:id"
        element={
          <StoreLayout>
            <ProtectedRoute><OrderDetail /></ProtectedRoute>
          </StoreLayout>
        }
      />
      <Route path="*" element={<StoreLayout><NotFound /></StoreLayout>} />
    </Routes>
  );
}
