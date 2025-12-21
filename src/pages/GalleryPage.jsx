// src/pages/GalleryPage.jsx
import { useEffect, useState } from "react";
import API from "../api/axiosInstance";

export default function GalleryPage() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [filterCategory, setFilterCategory] = useState("");

  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");

  // ✅ Correct uploads base URL
  const uploadsBase =
    process.env.REACT_APP_API_BASE_URL
      ? process.env.REACT_APP_API_BASE_URL.replace(/\/api\/?$/, "")
      : "http://localhost:5000";

  // ✅ Normalize backend response
  const normalizeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  // ✅ Fetch gallery
  const fetchGallery = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filterCategory.trim()) params.category = filterCategory.trim();

      const res = await API.get("/gallery", { params });
      const arr = normalizeArray(res.data);
      setGallery(arr);
    } catch (err) {
      console.error("fetchGallery error:", err);
      setError("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory]);

  // ✅ Delete gallery item
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await API.delete(`/gallery/${id}`);
      setGallery((prev) => prev.filter((g) => (g._id || g.id) !== id));
      setMessage("Deleted successfully");
    } catch (err) {
      console.error("delete gallery error:", err);
      setError("Delete failed");
    }
  };

  // ✅ Open edit modal
  const openEdit = (item) => {
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditCategory(item.category || "gallery");
  };

  // ✅ Save edit
  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setUploading(true);
      const id = editingItem._id || editingItem.id;

      const res = await API.put(`/gallery/${id}`, {
        title: editTitle.trim(),
        category: editCategory.trim(),
      });

      const updated = res.data;

      setGallery((prev) =>
        prev.map((g) =>
          (g._id || g.id) === id ? updated : g
        )
      );

      setEditingItem(null);
      setMessage("Updated successfully");
    } catch (err) {
      console.error("update gallery error:", err);
      setError("Update failed");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Correct image resolver
  const getImageSrc = (item) => {
    if (!item?.image) return "";
    return item.image.startsWith("http")
      ? item.image
      : `${uploadsBase}/uploads/${item.image}`;
  };

  const categoriesFromData = Array.from(
    new Set(
      gallery
        .map((g) => (g.category || "").trim())
        .filter(Boolean)
    )
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>Gallery</h2>
          <small className="text-muted">
            Manage uploaded images
          </small>
        </div>

        <select
          className="form-select form-select-sm"
          style={{ maxWidth: 200 }}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categoriesFromData.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div> 

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : gallery.length === 0 ? (
        <div className="text-muted">No images found</div>
      ) : (
        <div className="row">
          {gallery.map((img) => {
            const id = img._id || img.id;
            return (
              <div key={id} className="col-3 col-md-3 mb-4">
                <div className="card h-100 shadow-sm">
                  <div style={{ height: 160, overflow: "hidden" }}>
                    <img
                      src={getImageSrc(img)}
                      alt={img.title || "gallery"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  <div className="card-body p-2">
                    <strong className="small d-block text-truncate">
                      {img.title || "Untitled"}
                    </strong>
                    <span className="badge bg-light text-muted small">
                      {img.category || "gallery"}
                    </span>

                    <div className="d-flex justify-content-between mt-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openEdit(img)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Edit Modal */}
      {editingItem && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleEditSave}>
                <div className="modal-header">
                  <h5>Edit Gallery Item</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingItem(null)}
                  />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      className="form-control"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <input
                      className="form-control"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingItem(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploading}
                  >
                    {uploading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
