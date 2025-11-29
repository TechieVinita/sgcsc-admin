// src/pages/ResultsList.jsx
import { useEffect, useMemo, useState } from 'react';
import API from '../api/api';

const emptyForm = {
  enrollmentNumber: '',
  rollNo: '',
  course: '',
};

export default function ResultsList() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info');

  const [search, setSearch] = useState('');

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    setMsg('');
    try {
      const data = await API.unwrap(API.get('/results'));
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setResults(arr);
    } catch (err) {
      console.error('fetch results', err);
      setMsgType('danger');
      setMsg(err.userMessage || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this result?')) return;
    setMsg('');
    try {
      await API.delete(`/results/${id}`);
      setResults((prev) => prev.filter((r) => (r._id || r.id) !== id));
      setMsgType('success');
      setMsg('Result deleted.');
    } catch (err) {
      console.error('delete result', err);
      setMsgType('danger');
      setMsg(err.userMessage || 'Failed to delete result');
    }
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({
      enrollmentNumber: r.enrollmentNumber || '',
      rollNo: r.rollNo || '',
      course: r.course || '',
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing) return;

    if (!form.enrollmentNumber.trim()) {
      setMsgType('danger');
      setMsg('Enrollment Number is required.');
      return;
    }
    if (!form.rollNo.trim()) {
      setMsgType('danger');
      setMsg('Roll No is required.');
      return;
    }
    if (!form.course.trim()) {
      setMsgType('danger');
      setMsg('Course is required.');
      return;
    }

    setSaving(true);
    setMsg('');
    try {
      const payload = {
        enrollmentNumber: form.enrollmentNumber.trim(),
        rollNo: form.rollNo.trim(),
        course: form.course.trim(),
      };

      const updated = await API.unwrap(
        API.put(`/results/${editing._id || editing.id}`, payload)
      );

      setResults((prev) =>
        prev.map((r) =>
          (r._id || r.id) === (editing._id || editing.id) ? updated : r
        )
      );

      setMsgType('success');
      setMsg('Result updated.');
      setEditing(null);
      setForm(emptyForm);
    } catch (err) {
      console.error('update result', err);
      setMsgType('danger');
      setMsg(err.userMessage || 'Failed to update result');
    } finally {
      setSaving(false);
    }
  };

  const filteredResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return results;

    return results.filter((r) => {
      const e = (r.enrollmentNumber || '').toLowerCase();
      const roll = (r.rollNo || '').toLowerCase();
      const c = (r.course || '').toLowerCase();
      return e.includes(q) || roll.includes(q) || c.includes(q);
    });
  }, [results, search]);

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="flex-grow-1">
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h2 className="mb-0">Results</h2>
              <div className="small text-muted">
                Manage student results (Enrollment, Roll, Course)
              </div>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by enrollment / roll / course"
                style={{ minWidth: 220 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={fetchResults}
                disabled={loading}
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>

          {msg && (
            <div
              className={`alert alert-${
                msgType === 'danger'
                  ? 'danger'
                  : msgType === 'success'
                  ? 'success'
                  : 'info'
              }`}
            >
              {msg}
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="p-3 text-center">Loading results…</div>
              ) : filteredResults.length === 0 ? (
                <div className="p-3 text-center text-muted">
                  No results found.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Enrollment Number</th>
                        <th>Roll No</th>
                        <th>Course</th>
                        <th style={{ width: 140 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((r) => (
                        <tr key={r._id || r.id}>
                          <td>{r.enrollmentNumber}</td>
                          <td>{r.rollNo}</td>
                          <td>{r.course}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => openEdit(r)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(r._id || r.id)
                              }
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

      {/* Edit Modal */}
      {editing && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <form onSubmit={handleUpdate}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Result</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setEditing(null);
                      setForm(emptyForm);
                    }}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Enrollment Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="enrollmentNumber"
                      value={form.enrollmentNumber}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Roll No.</label>
                    <input
                      type="text"
                      className="form-control"
                      name="rollNo"
                      value={form.rollNo}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Course</label>
                    <input
                      type="text"
                      className="form-control"
                      name="course"
                      value={form.course}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(null);
                      setForm(emptyForm);
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
                    {saving ? 'Saving…' : 'Save Changes'}
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
