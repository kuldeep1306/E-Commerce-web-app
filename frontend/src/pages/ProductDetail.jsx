import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import { resolveImageUrl } from "../utils/imageUrl.js";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      toast.success("Review submitted");
      setReviewForm({ rating: 5, comment: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader full />;
  if (!product) return <div className="container-app py-16 text-center text-ink-500">Product not found.</div>;

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div className="container-app py-6">
      <nav className="text-sm text-ink-500 mb-4">
        <Link to="/" className="hover:text-primary-600">Home</Link> / <span className="text-ink-900">{product.category}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="card aspect-square overflow-hidden mb-3">
            {product.images?.[activeImg] ? (
              <img src={resolveImageUrl(product.images[activeImg])} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-ink-500">No image</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`h-16 w-16 rounded-lg overflow-hidden border-2 ${activeImg === idx ? "border-primary-500" : "border-transparent"}`}
                >
                  <img src={resolveImageUrl(img)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">{product.category}</p>
          <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">{product.name}</h1>
          {product.ratings > 0 && (
            <div className="flex items-center gap-1 mt-2 text-sm text-ink-500">
              <span className="text-accent-500">★</span> {product.ratings.toFixed(1)} ({product.numReviews} reviews)
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-ink-900">₹{displayPrice.toLocaleString("en-IN")}</span>
            {hasDiscount && <span className="text-ink-500 line-through">₹{product.price.toLocaleString("en-IN")}</span>}
          </div>
          <p className="text-sm mt-1 text-ink-500">Inclusive of all taxes</p>

          <p className="mt-5 text-ink-700 leading-relaxed">{product.description}</p>

          <p className={`mt-4 text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
            {product.stock > 0 ? `In stock (${product.stock} available)` : "Out of stock"}
          </p>

          {product.stock > 0 && (
            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center border border-ink-300 rounded-lg">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-ink-700">−</button>
                <span className="px-4 font-medium">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 text-ink-700">+</button>
              </div>
              <button onClick={() => addToCart(product, qty)} className="btn-primary flex-1">Add to cart</button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 max-w-2xl">
        <h2 className="font-display font-bold text-lg text-ink-900 mb-4">Customer reviews</h2>
        {product.reviews?.length === 0 && <p className="text-sm text-ink-500 mb-6">No reviews yet. Be the first to review this product.</p>}
        <div className="space-y-4 mb-8">
          {product.reviews?.map((r) => (
            <div key={r._id} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-ink-900">{r.name}</span>
                <span className="text-accent-500 text-sm">{"★".repeat(r.rating)}</span>
              </div>
              {r.comment && <p className="text-sm text-ink-700 mt-1">{r.comment}</p>}
            </div>
          ))}
        </div>

        {user ? (
          <form onSubmit={submitReview} className="card p-4 space-y-3">
            <p className="font-medium text-sm text-ink-900">Write a review</p>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
              className="input !w-auto"
            >
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star</option>)}
            </select>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Share your experience..."
              className="input"
              rows={3}
            />
            <button disabled={submitting} className="btn-primary">Submit review</button>
          </form>
        ) : (
          <p className="text-sm text-ink-500"><Link to="/login" className="text-primary-600 font-medium">Sign in</Link> to write a review.</p>
        )}
      </div>
    </div>
  );
}
