// src/pages/AddGalleryCategory.jsx
import { useState } from 'react';
import API from "../api/axiosInstance";

export default function AddGalleryCategory() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('gallery');
  const [imageFile, setImageFile] = useState(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setImageFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!imageFile && !externalUrl.trim()) {
      setError('Please upload an image file or provide an external image URL.');
      return;
    }

    if (!title.trim()) {
      setError('Name / Title is required.');
      return;
    }

    if (!category.trim()) {
      setError('Category is required.');
      return;
    }

    try {
      setSaving(true);
      const form = new FormData();
      form.append('title', title.trim());
      form.append('category', category.trim());
      if (imageFile) form.append('image', imageFile);
      if (externalUrl.trim()) form.append('url', externalUrl.trim());

      await API.post('/gallery', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTitle('');
      setCategory('gallery');
      setImageFile(null);
      setExternalUrl('');
      setMessage('Gallery item created successfully.');
    } catch (err) {
      console.error('add gallery category error:', err);
      setError(err.userMessage || 'Failed to save gallery item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-3">Add Gallery Item (with Category)</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-12">
              <label className="form-label">Name / Title *</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="col-md-12">
              <label className="form-label">Category *</label>
              <input
                type="text"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. gallery, affiliation, event"
                required
              />
              <small className="text-muted">
                Use consistent names, e.g. <code>gallery</code>, <code>affiliation</code>, etc.
              </small>
            </div>

            <div className="col-md-12">
              <label className="form-label">Upload Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleFileChange}
              />
              <small className="text-muted">
                Recommended size: 100KB – 300KB for faster uploads.
              </small>
            </div>

            {/* <div className="col-md-6">
              <label className="form-label">OR External Image URL</label>
              <input
                type="url"
                className="form-control"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <small className="text-muted">
                If provided, this URL will be used instead of uploaded file.
              </small>
            </div> */}

            <div className="col-12 text-end">
              <button
                type="submit"
                className="col-md-12 btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
