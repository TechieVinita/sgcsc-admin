// src/pages/Members.jsx
import { useEffect, useState } from 'react';
import API from '../api/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const emptyMember = {
  name: '',
  role: '',
  bio: '',
  img: '',
  order: 0,
  isActive: true,
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // member being edited
  const [form, setForm] = useState(emptyMember);

  const fetchMembers = async () => {
    setLoading(true);
    setError('');
    try {
      // Expecting GET /members to return an array
      const data = await API.unwrap(API.get('/members'));
      const arr = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      setMembers(arr);
    } catch (err) {
      console.error('fetchMembers error:', err);
      setError(err.userMessage || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openAddModal = () => {
    setEditing(null);
    setForm(emptyMember);
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setEditing(member);
    setForm({
      name: member.name || '',
      role: member.role || '',
      bio: member.bio || '',
      img: member.img || '',
      order: member.order || 0,
      isActive: member.isActive !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    try {
      await API.delete(`/members/${id}`);
      setMembers((prev) => prev.filter((m) => m._id !== id && m.id !== id));
    } catch (err) {
      console.error('delete member error:', err);
      setError(err.userMessage || 'Failed to delete member');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      bio: form.bio.trim(),
      img: form.img.trim(),
      order: Number(form.order) || 0,
      isActive: !!form.isActive,
    };

    try {
      let saved;
      if (editing) {
        // update
        saved = await API.unwrap(
          API.put(`/members/${editing._id || editing.id}`, payload)
        );
        setMembers((prev) =>
          prev.map((m) =>
            (m._id || m.id) === (editing._id || editing.id) ? saved : m
          )
        );
      } else {
        // create
        saved = await API.unwrap(API.post('/members', payload));
        setMembers((prev) => [saved, ...prev]);
      }
      setShowModal(false);
      setEditing(null);
      setForm(emptyMember);
    } catch (err) {
      console.error('save member error:', err);
      setError(err.userMessage || 'Failed to save member');
    } finally {
      setSaving(false);
    }
  };

  const sortedMembers = [...members].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar />

      <div className="flex-grow-1">
        <Navbar />

        <div className="container-fluid p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h2 className="fw-bold mb-0">Institute Members</h2>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={fetchMembers}
                disabled={loading}
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
              <button className="btn btn-primary" onClick={openAddModal}>
                Add Member
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="p-4 text-center">Loading members…</div>
              ) : sortedMembers.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  No members added yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-primary">
                      <tr>
                        <th scope="col">Order</th>
                        <th scope="col">Photo</th>
                        <th scope="col">Name</th>
                        <th scope="col">Role</th>
                        <th scope="col">Active</th>
                        <th scope="col">Updated</th>
                        <th scope="col" className="text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMembers.map((m) => (
                        <tr key={m._id || m.id}>
                          <td>{m.order ?? 0}</td>
                          <td>
                            {m.img ? (
                              <img
                                src={m.img}
                                alt={m.name}
                                style={{
                                  width: 40,
                                  height: 40,
                                  objectFit: 'cover',
                                  borderRadius: '50%',
                                }}
                              />
                            ) : (
                              <span className="text-muted small">No image</span>
                            )}
                          </td>
                          <td>{m.name}</td>
                          <td>{m.role || '-'}</td>
                          <td>
                            {m.isActive === false ? (
                              <span className="badge bg-secondary">Hidden</span>
                            ) : (
                              <span className="badge bg-success">Active</span>
                            )}
                          </td>
                          <td>
                            {m.updatedAt
                              ? new Date(m.updatedAt).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => openEditModal(m)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(m._id || m.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editing ? 'Edit Member' : 'Add Member'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false);
                      setEditing(null);
                      setForm(emptyMember);
                    }}
                  />
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Role / Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Bio / Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label">
                        Photo URL (will be used on public site)
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        name="img"
                        value={form.img}
                        onChange={handleChange}
                      />
                      <small className="text-muted">
                        You can paste a direct image URL from your uploads or
                        any CDN.
                      </small>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Order</label>
                      <input
                        type="number"
                        className="form-control"
                        name="order"
                        value={form.order}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="member-active"
                          name="isActive"
                          checked={form.isActive}
                          onChange={handleChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="member-active"
                        >
                          Show on site
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditing(null);
                      setForm(emptyMember);
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving…' : 'Save Member'}
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
