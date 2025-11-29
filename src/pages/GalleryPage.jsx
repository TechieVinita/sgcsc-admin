// src/pages/GalleryPage.jsx
import { useEffect, useState } from 'react';
import API from '../api/api';

export default function GalleryPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('gallery');
  const [imageFile, setImageFile] = useState(null);
  const [externalUrl, setExternalUrl] = useState('');

  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [editingItem, setEditingItem] = useState(null); // for name/category edits
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Derive uploads base URL (strip trailing /api if present)
  const apiBase =
    process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const uploadsBase = apiBase.replace(/\/api\/?$/, '');

  const normalizeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  };

  const fetchGallery = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const params = {};
      if (filterCategory.trim()) params.category = filterCategory.trim();

      const data = await API.unwrap(
        API.get('/gallery', { params })
      );
      const arr = normalizeArray(data);
      setGallery(arr);
    } catch (err) {
      console.error('fetchGallery', err);
      setError(err.userMessage || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory]);

  const handleFileChange = (e) => {
    setImageFile(e.target.files?.[0] ?? null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!title.trim()) {
      setError('Please provide a name / title.');
      return;
    }
    if (!imageFile && !externalUrl.trim()) {
      setError('Please upload an image or provide an external URL.');
      return;
    }

    try {
      setUploading(true);
      const form = new FormData();
      form.append('title', title.trim());
      form.append('category', category.trim() || 'gallery');
      if (imageFile) form.append('image', imageFile);
      if (externalUrl.trim()) form.append('url', externalUrl.trim());

      await API.post('/gallery', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTitle('');
      setCategory('gallery');
      setImageFile(null);
      setExternalUrl('');
      setMessage('Image uploaded successfully.');
      await fetchGallery();
    } catch (err) {
      console.error('upload gallery', err);
      setError(err.userMessage || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    setMessage('');
    setError('');
    try {
      await API.delete(`/gallery/${id}`);
      setMessage('Deleted.');
      setGallery((prev) => prev.filter((g) => (g._id || g.id) !== id));
    } catch (err) {
      console.error('delete gallery', err);
      setError(err.userMessage || 'Delete failed');
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setEditTitle(item.title || item.name || '');
    setEditCategory(item.category || 'gallery');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setUploading(true);
      const id = editingItem._id || editingItem.id;
      const payload = {
        title: editTitle.trim(),
        category: editCategory.trim(),
      };

      const saved = await API.unwrap(
        API.put(`/gallery/${id}`, payload)
      );

      setGallery((prev) =>
        prev.map((g) =>
          (g._id || g.id) === id ? saved : g
        )
      );
      setEditingItem(null);
      setEditTitle('');
      setEditCategory('');
      setMessage('Gallery item updated.');
    } catch (err) {
      console.error('update gallery', err);
      setError(err.userMessage || 'Update failed');
    } finally {
      setUploading(false);
    }
  };

  const getImageSrc = (item) => {
    if (!item) return '';

    // New schema: `image` field may be a filename or a full URL
    if (item.image) {
      if (item.image.startsWith('http')) return item.image;
      return `${uploadsBase}/uploads/${item.image}`;
    }

    // Backwards compatibility: `url` or `secure_url`
    if (item.url) {
      if (item.url.startsWith('http')) return item.url;
      return `${uploadsBase}/uploads/${item.url}`;
    }
    if (item.secure_url) return item.secure_url;

    if (typeof item === 'string') {
      return item.startsWith('http')
        ? item
        : `${uploadsBase}/uploads/${item}`;
    }
    return '';
  };

  const categoriesFromData = Array.from(
    new Set(
      (gallery || [])
        .map((g) => (g.category || '').trim())
        .filter(Boolean)
    )
  );

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h2 className="mb-0">Gallery</h2>
              <small className="text-muted">
                Upload images and organize them by category.
              </small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm"
                style={{ minWidth: 180 }}
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
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={fetchGallery}
                disabled={loading}
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>

          {message && <div className="alert alert-info">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Upload form */}
          <div className="card mb-4">
            <div className="card-body">
              <form
                onSubmit={handleUpload}
                className="row g-3 align-items-end"
              >
                <div className="col-md-4">
                  <label className="form-label">Name / Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Category *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. gallery, affiliation"
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">
                    Upload Image (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">
                    External URL (optional)
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="col-12 text-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* List images */}
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div>Loading gallery...</div>
              ) : gallery.length === 0 ? (
                <div className="text-muted">No images yet.</div>
              ) : (
                <div className="row">
                  {gallery.map((img) => {
                    const id = img._id || img.id;
                    return (
                      <div key={id} className="col-6 col-md-3 mb-4">
                        <div className="card h-100 shadow-sm">
                          <div style={{ height: 160, overflow: 'hidden' }}>
                            <img
                              src={getImageSrc(img)}
                              alt={img.title || img.name || 'gallery'}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          </div>
                          <div className="card-body p-2 d-flex flex-column">
                            <div className="mb-1">
                              <strong className="small d-block text-truncate">
                                {img.title || img.name || 'Untitled'}
                              </strong>
                              <span className="badge bg-light text-muted small">
                                {img.category || 'gallery'}
                              </span>
                            </div>
                            <div className="mt-auto d-flex justify-content-between">
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
            </div>
          </div>

          {/* Edit modal */}
          {editingItem && (
            <div
              className="modal d-block"
              tabIndex="-1"
              role="dialog"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <form onSubmit={handleEditSave}>
                    <div className="modal-header">
                      <h5 className="modal-title">Edit Gallery Item</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setEditingItem(null)}
                      />
                    </div>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label">
                          Name / Title
                        </label>
                        <input
                          className="form-control"
                          value={editTitle}
                          onChange={(e) =>
                            setEditTitle(e.target.value)
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          Category
                        </label>
                        <input
                          className="form-control"
                          value={editCategory}
                          onChange={(e) =>
                            setEditCategory(e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditingItem(null)}
                        disabled={uploading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={uploading}
                      >
                        {uploading ? 'Saving…' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
