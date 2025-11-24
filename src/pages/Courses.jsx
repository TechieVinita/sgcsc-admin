// src/pages/Courses.jsx
import React, { useEffect, useState } from 'react';
import API from '../api/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// DEV sample image
const DEV_SAMPLE_IMAGE = '/mnt/data/58e83842-f724-41ef-b678-0d3ad1e30ed8.png';

function CourseModal({ show, onClose, onSaved, initial }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [duration, setDuration] = useState(initial?.duration ?? '');
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [type, setType] = useState(initial?.type ?? 'long');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setTitle(initial?.title ?? '');
      setDescription(initial?.description ?? '');
      setDuration(initial?.duration ?? '');
      setPrice(initial?.price ?? 0);
      setType(initial?.type ?? 'long');
      setImageFile(null);
      setError('');
    }
  }, [show, initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) return setError('Title is required');
    setSaving(true);

    try {
      // Use multipart when image is present
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      form.append('duration', duration);
      form.append('price', price || 0);
      form.append('type', type);
      if (imageFile) form.append('image', imageFile);

      if (initial && initial._id) {
        // update
        const res = await API.put(`/courses/${initial._id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onSaved(res.data?.data ?? res.data);
      } else {
        // create
        const res = await API.post('/courses', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onSaved(res.data?.data ?? res.data);
      }
    } catch (err) {
      console.error('save course', err);
      setError(err.userMessage || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;
  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{initial?._id ? 'Edit Course' : 'Add Course'}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Title</label>
                <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>

              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="long">Long Term (1 Year)</option>
                    <option value="short">Short Term (6 Months)</option>
                    <option value="certificate">Certificate (3 Months)</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Duration (text)</label>
                  <input className="form-control" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="eg. 1 Year" />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Price (₹)</label>
                  <input type="number" className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} min="0" />
                </div>
              </div>

              <div className="mb-3 mt-3">
                <label className="form-label">Image (optional)</label>
                <input type="file" accept="image/*" className="form-control" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
                <div className="small text-muted mt-2">Recommended: 100KB - 300KB for faster uploads.</div>
                {initial?.image && !imageFile && (
                  <div className="mt-2">
                    <img src={initial.image || DEV_SAMPLE_IMAGE} alt="course" style={{ width: 160, height: 90, objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await API.unwrap(API.get('/courses'));
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('load courses', err);
      setError(err.userMessage || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = () => {
    setEditCourse(null);
    setShowModal(true);
  };

  const handleEdit = (c) => {
    setEditCourse(c);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await API.delete(`/courses/${id}`);
      setCourses((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      console.error('delete course', err);
      alert(err.userMessage || 'Failed to delete');
    }
  };

  // called when modal saves (create or update)
  const onSaved = (saved) => {
    // server may return created resource or whole list
    if (!saved) {
      setShowModal(false);
      load();
      return;
    }

    // if exists in list update, otherwise prepend
    setCourses((prev) => {
      const idx = prev.findIndex((x) => x._id === saved._id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });

    setShowModal(false);
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-0">Courses</h2>
              <div className="small text-muted">Manage long/short/certificate courses</div>
            </div>
            <div>
              <button className="btn btn-outline-secondary me-2" onClick={load}>Refresh</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Course</button>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div>Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="text-muted">No courses yet. Click "Add Course" to create one.</div>
          ) : (
            <div className="row">
              {courses.map((c) => (
                <div className="col-md-4 mb-3" key={c._id}>
                  <div className="card h-100">
                    <div style={{ height: 160, overflow: 'hidden' }}>
                      <img src={c.image || DEV_SAMPLE_IMAGE} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{c.title}</h5>
                      <p className="card-text small text-muted" style={{ flex: 1 }}>{c.description || '—'}</p>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <small className="text-muted">{c.type} • {c.duration}</small>
                        <div>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(c)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c._id)}>Delete</button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <strong>₹{c.price ?? 0}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <CourseModal show={showModal} onClose={() => setShowModal(false)} onSaved={onSaved} initial={editCourse} />
        </div>
      </div>
    </div>
  );
}
