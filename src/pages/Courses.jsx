// src/pages/Courses.jsx
import { useEffect, useState } from 'react';
import API from '../api/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// local fallback image if course has no image
const DEV_SAMPLE_IMAGE =
  'https://via.placeholder.com/400x200.png?text=Course+Image';

// Try to derive API origin (http://localhost:5000) from axios baseURL
let API_ORIGIN = '';
try {
  const base = API?.defaults?.baseURL || '';
  if (base) {
    API_ORIGIN = new URL(base).origin; // e.g. http://localhost:5000
  } else {
    API_ORIGIN = window.location.origin;
  }
} catch {
  API_ORIGIN = window.location.origin;
}

// Build a usable image URL from whatever the backend stored
function getCourseImageUrl(course) {
  const raw =
    course.image || course.imageUrl || course.imagePath || '';

  if (!raw) return DEV_SAMPLE_IMAGE;

  // absolute URL already
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  // common case: filename only (stored by multer)
  // we serve uploads at /uploads/* from the backend
  if (!raw.startsWith('/')) {
    return `${API_ORIGIN}/uploads/${raw}`;
  }

  // already a path like /uploads/xxx
  return `${API_ORIGIN}${raw}`;
}

function CourseModal({ show, onClose, onSaved, initial }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(
    initial?.description ?? ''
  );
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

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    try {
      const form = new FormData();
      // IMPORTANT: send 'title' (not 'name')
      form.append('title', trimmedTitle);
      form.append('description', description || '');
      form.append('duration', duration || '');
      form.append('price', price || 0);
      form.append('type', type || 'long');
      if (imageFile) form.append('image', imageFile); // field name MUST match multer .single('image')

      let savedCourse;

      if (initial && (initial._id || initial.id)) {
        // UPDATE
        const id = initial._id || initial.id;
        savedCourse = await API.unwrap(
          API.put(`/courses/${id}`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        );
      } else {
        // CREATE
        savedCourse = await API.unwrap(
          API.post('/courses', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        );
      }

      onSaved(savedCourse);
    } catch (err) {
      console.error('save course error:', err);
      // If Mongoose sends validation message, surface it
      const backendMessage =
        err?.response?.data?.message ||
        err.userMessage ||
        'Failed to save course';
      setError(backendMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: 'rgba(0,0,0,0.4)' }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">
                {initial?._id || initial?.id ? 'Edit Course' : 'Add Course'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={saving}
              />
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="long">Long Term (1 Year)</option>
                    <option value="short">Short Term (6 Months)</option>
                    <option value="certificate">
                      Certificate (3 Months)
                    </option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Duration (text)</label>
                  <input
                    className="form-control"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 1 year"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="mb-3 mt-3">
                <label className="form-label">Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) =>
                    setImageFile(e.target.files?.[0] ?? null)
                  }
                />
                <div className="small text-muted mt-2">
                  Recommended: 100KB – 300KB for faster uploads.
                </div>

                {initial && initial.image && !imageFile && (
                  <div className="mt-2">
                    <img
                      src={getCourseImageUrl(initial)}
                      alt="course"
                      style={{
                        width: 160,
                        height: 90,
                        objectFit: 'cover',
                        borderRadius: 8,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Course'}
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
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setCourses(arr);
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

  const handleEdit = (course) => {
    setEditCourse(course);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await API.delete(`/courses/${id}`);
      setCourses((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      console.error('delete course', err);
      alert(err.userMessage || 'Failed to delete course');
    }
  };

  const handleSaved = (saved) => {
    if (!saved || !saved._id) {
      setShowModal(false);
      load();
      return;
    }

    setCourses((prev) => {
      const idx = prev.findIndex((c) => c._id === saved._id);
      if (idx === -1) return [saved, ...prev];
      const copy = [...prev];
      copy[idx] = saved;
      return copy;
    });

    setShowModal(false);
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar />

      <div className="flex-grow-1">
        <Navbar />

        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-0">Courses</h2>
              <div className="small text-muted">
                Manage long / short / certificate courses
              </div>
            </div>
            <div>
              <button
                className="btn btn-outline-secondary me-2"
                onClick={load}
                disabled={loading}
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAdd}
              >
                Add Course
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-muted">Loading courses…</div>
          ) : courses.length === 0 ? (
            <div className="text-muted">
              No courses yet. Click <strong>Add Course</strong> to create
              one.
            </div>
          ) : (
            <div className="row">
              {courses.map((c) => (
                <div className="col-md-4 mb-3" key={c._id || c.id}>
                  <div className="card h-100 shadow-sm border-0">
                    <div
                      style={{
                        height: 180,
                        overflow: 'hidden',
                        borderTopLeftRadius: '0.5rem',
                        borderTopRightRadius: '0.5rem',
                      }}
                    >
                      <img
                        src={getCourseImageUrl(c)}
                        alt={c.title || 'Course'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title mb-1">
                        {c.title || 'Untitled course'}
                      </h5>
                      <p
                        className="card-text small text-muted mb-2"
                        style={{ flex: 1 }}
                      >
                        {c.description || 'No description provided.'}
                      </p>

                      <div className="small text-muted mb-2">
                        {(c.type || 'long')}{' '}
                        {c.duration ? `• ${c.duration}` : ''}
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <strong>₹{c.price ?? 0}</strong>
                        <div>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(c)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(c._id || c.id)
                            }
                          >
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

          <CourseModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onSaved={handleSaved}
            initial={editCourse}
          />
        </div>
      </div>
    </div>
  );
}
