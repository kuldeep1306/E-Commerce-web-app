// Backend origin (API base URL without the trailing /api), used to resolve
// images uploaded to the server (e.g. "/uploads/product-123.jpg") into a
// full URL the browser can load, regardless of which port/domain serves
// the frontend.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, "");

// Accepts either a full URL (http://..., https://...) which is returned
// as-is, or a server-relative path (/uploads/...) which is prefixed with
// the backend origin.
export function resolveImageUrl(src) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  return `${SERVER_ORIGIN}${src.startsWith("/") ? "" : "/"}${src}`;
}
