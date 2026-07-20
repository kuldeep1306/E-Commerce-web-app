import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import Loader from "../components/Loader.jsx";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products/categories").then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (keyword) params.keyword = keyword;
    if (category !== "all") params.category = category;
    if (sort) params.sort = sort;

    api
      .get("/products", { params })
      .then(({ data }) => {
        setProducts(data.products);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  }, [keyword, category, sort, page]);

  return (
    <div className="container-app py-6">
      {!keyword && (
        <div className="rounded-xl2 bg-primary-500 text-white p-6 sm:p-10 mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-lg">
            <h1 className="text-2xl sm:text-4xl font-display font-bold leading-tight">
              Everyday essentials,<br /> honest prices.
            </h1>
            <p className="mt-3 text-primary-50 text-sm sm:text-base">
              Handpicked products, fast delivery, and secure checkout with Razorpay.
            </p>
          </div>
          <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-primary-400/40" />
          <div className="absolute right-16 -top-10 h-24 w-24 rounded-full bg-accent-500/30" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="font-display font-bold text-xl text-ink-900">
          {keyword ? `Results for "${keyword}"` : "All products"}
        </h2>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="input !w-auto text-sm"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="input !w-auto text-sm"
          >
            <option value="">Sort: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-ink-500">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-9 w-9 rounded-lg text-sm font-medium ${
                p === page ? "bg-primary-500 text-white" : "bg-white border border-ink-300 text-ink-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
