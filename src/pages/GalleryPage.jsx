// src/pages/GalleryPage.jsx
import { useEffect, useState } from 'react';
import API from '../api/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function GalleryPage() {
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Derive uploads base URL (strip trailing /api if present)
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const uploadsBase = apiBase.replace(/\/api\/?$/, '');

  const fetchGallery = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await API.unwrap(API.get('/gallery'));
      setGallery(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchGallery', err);
      setMessage(err.userMessage || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e) => {
    setImageFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!title.trim() && !imageFile) {
      setMessage('Please provide a title or choose an image.');
      return;
    }
    try {
      setUploading(true);
      const form = new FormData();
      form.append('title', title);
      if (imageFile) form.append('image', imageFile);

      // POST to /api/gallery (server multer expects 'image' field)
      await API.post('/gallery', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTitle('');
      setImageFile(null);
      setMessage('Image uploaded successfully.');
      await fetchGallery();
    } catch (err) {
      console.error('upload gallery', err);
      setMessage(err.userMessage || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    setMessage('');
    try {
      await API.delete(`/gallery/${id}`);
      setMessage('Deleted.');
      setGallery((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      console.error('delete gallery', err);
      setMessage(err.userMessage || 'Delete failed');
    }
  };

  const getImageSrc = (item) => {
    // Accept different shapes: item.url, item.secure_url, item.image (filename)
    if (!item) return '';
    if (item.url) return item.url;
    if (item.secure_url) return item.secure_url;
    if (item.image) {
      // older servers stored filename in `image` field
      return `${uploadsBase}/uploads/${item.image}`;
    }
    // fallback: if item is string
    if (typeof item === 'string') {
      return item.startsWith('http') ? item : `${uploadsBase}/uploads/${item}`;
    }
    return '';
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />
        <div className="p-4">
          <h2 className="mb-4">Gallery</h2>

          {message && <div className="alert alert-info">{message}</div>}

          <div className="card mb-4">
            <div className="card-body">
              <form onSubmit={handleSubmit} className="row g-3 align-items-end">
                <div className="col-md-5">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Image title (optional)"
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Image</label>
                  <input type="file" accept="image/*" className="form-control" onChange={handleFileChange} />
                </div>
                <div className="col-md-2 text-end">
                  <button type="submit" className="btn btn-primary w-100" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              {loading ? (
                <div>Loading gallery...</div>
              ) : gallery.length === 0 ? (
                <div className="text-muted">No images yet.</div>
              ) : (
                <div className="row">
                  {gallery.map((img) => (
                    <div key={img._id} className="col-6 col-md-3 mb-4">
                      <div className="card h-100 shadow-sm">
                        <div style={{ height: 160, overflow: 'hidden' }}>
                          <img
                            src={getImageSrc(img)}
                            alt={img.title || 'gallery'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.src = `${uploadsBase}/uploads/${img.image || ''}`;
                            }}
                          />
                        </div>
                        <div className="card-body p-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-truncate" style={{ maxWidth: '70%' }}>
                              {img.title || 'Untitled'}
                            </small>
                            <div>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(img._id)}>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
