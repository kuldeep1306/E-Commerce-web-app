import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import { resolveImageUrl } from "../../utils/imageUrl.js";

const MAX_IMAGES = 3;

const empty = {
  name: "", description: "", price: "", discountPrice: "", category: "", brand: "",
  stock: "", sku: "", images: [], isActive: true,
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`).then(({ data }) => {
        const p = data.product;
        setForm({
          name: p.name, description: p.description, price: p.price, discountPrice: p.discountPrice || "",
          category: p.category, brand: p.brand || "", stock: p.stock, sku: p.sku || "",
          images: p.images || [], isActive: p.isActive,
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file later
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - form.images.length;
    if (remainingSlots <= 0) {
      toast.error(`You can only add up to ${MAX_IMAGES} images`);
      return;
    }
    const toUpload = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast(`Only ${remainingSlots} more image(s) can be added (max ${MAX_IMAGES})`, { icon: "ℹ️" });
    }

    const formData = new FormData();
    toUpload.forEach((file) => formData.append("images", file));

    setUploading(true);
    try {
      const { data } = await api.post("/products/upload-images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, images: [...f.images, ...data.urls] }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.images.length === 0) {
      toast.error("Please add at least 1 product image");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : 0,
      stock: Number(form.stock),
    };
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader full />;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display font-bold text-2xl text-ink-900 mb-6">{isEdit ? "Edit product" : "Add new product"}</h1>
      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <div>
          <label className="label">Product name</label>
          <input required name="name" value={form.name} onChange={handleChange} className="input" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea required name="description" value={form.description} onChange={handleChange} className="input" rows={4} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Price (₹)</label>
            <input required type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">Discount price (₹, optional)</label>
            <input type="number" min="0" step="0.01" name="discountPrice" value={form.discountPrice} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">Category</label>
            <input required name="category" value={form.category} onChange={handleChange} className="input" placeholder="e.g. Electronics" />
          </div>
          <div>
            <label className="label">Brand</label>
            <input name="brand" value={form.brand} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">Stock quantity</label>
            <input required type="number" min="0" name="stock" value={form.stock} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">SKU (optional)</label>
            <input name="sku" value={form.sku} onChange={handleChange} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Product photos ({form.images.length}/{MAX_IMAGES})</label>
          <div className="flex flex-wrap gap-3">
            {form.images.map((img, idx) => (
              <div key={img + idx} className="relative h-24 w-24 rounded-lg overflow-hidden border border-ink-100 group">
                <img src={resolveImageUrl(img)} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-ink-900/70 text-white text-xs flex items-center justify-center"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
            {form.images.length < MAX_IMAGES && (
              <label className="h-24 w-24 rounded-lg border-2 border-dashed border-ink-300 flex flex-col items-center justify-center text-ink-500 text-xs cursor-pointer hover:border-primary-500 hover:text-primary-600">
                {uploading ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <span className="text-2xl leading-none mb-1">+</span>
                    <span>Add photo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  multiple
                  disabled={uploading}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="text-xs text-ink-500 mt-2">Upload 2–3 photos directly (JPG, PNG, WEBP or GIF, up to 5MB each).</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="h-4 w-4 rounded border-ink-300 text-primary-500" />
          Visible in store
        </label>

        <div className="flex gap-3 pt-2">
          <button disabled={saving || uploading} className="btn-primary">{saving ? "Saving..." : isEdit ? "Save changes" : "Create product"}</button>
          <button type="button" onClick={() => navigate("/admin/products")} className="btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
}
