import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { resolveImageUrl } from "../utils/imageUrl.js";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const pct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="card group overflow-hidden flex flex-col transition-shadow hover:shadow-cardHover">
      <Link to={`/product/${product._id}`} className="block relative aspect-square bg-ink-100 overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={resolveImageUrl(product.images[0])}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-500 text-sm">No image</div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 badge bg-accent-500 text-white shadow-sm">
            -{pct}%
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 badge bg-ink-900/80 text-white">Sold out</span>
        )}
      </Link>
      <div className="p-3.5 flex flex-col flex-1">
        <p className="text-xs text-primary-600 font-medium uppercase tracking-wide">{product.category}</p>
        <Link to={`/product/${product._id}`}>
          <h3 className="mt-1 text-sm font-semibold text-ink-900 line-clamp-2 leading-snug hover:text-primary-600">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-ink-900">₹{displayPrice.toLocaleString("en-IN")}</span>
          {hasDiscount && (
            <span className="text-xs text-ink-500 line-through">₹{product.price.toLocaleString("en-IN")}</span>
          )}
        </div>
        {product.ratings > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-ink-500">
            <span className="text-accent-500">★</span>
            <span>{product.ratings.toFixed(1)}</span>
            <span>({product.numReviews})</span>
          </div>
        )}
        <button
          onClick={() => addToCart(product, 1)}
          disabled={product.stock === 0}
          className="btn-primary mt-3 w-full text-xs py-2"
        >
          {product.stock === 0 ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
