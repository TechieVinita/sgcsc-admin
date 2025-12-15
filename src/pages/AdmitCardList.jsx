// src/pages/AdmitCardList.jsx
import { useEffect, useMemo, useState } from 'react';
import API from '../api/api';

function fmtDate(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleDateString('en-IN');
}

function AdmitCardModal({ show, onClose, onSaved, initial, courses }) {
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [courseId, setCourseId] = useState('');
  const [examCenter, setExamCenter] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!show) return;

    setError('');
    setSaving(false);

    if (initial) {
      setEnrollmentNumber(initial.enrollmentNumber || '');
      setRollNumber(initial.rollNumber || '');
      setCourseId(initial.course || '');
      setExamCenter(initial.examCenter || '');
      setExamDate(
        initial.examDate ? new Date(initial.examDate).toISOString().slice(0, 10) : ''
      );
      setExamTime(initial.examTime || '');
    } else {
      setEnrollmentNumber('');
      setRollNumber('');
      setCourseId('');
      setExamCenter('');
      setExamDate('');
      setExamTime('');
    }
  }, [show, initial]);

  if (!show) return null;

  const validate = () => {
    if (!enrollmentNumber.trim()) {
      setError('Enrollment Number is required.');
      return false;
    }
    if (!rollNumber.trim()) {
      setError('Roll Number is required.');
      return false;
    }
    if (!examDate) {
      setError('Exam Date is required.');
      return false;
    }
    if (!examTime.trim()) {
      setError('Exam Time is required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;
    setSaving(true);

    try {
      const selectedCourse = courses.find((c) => (c._id || c.id) === courseId);

      const payload = {
        enrollmentNumber: enrollmentNumber.trim(),
        rollNumber: rollNumber.trim(),
        examCenter: examCenter.trim(),
        examDate,
        examTime: examTime.trim(),
        courseId: courseId || undefined,
        courseName:
          selectedCourse?.name || selectedCourse?.title || undefined,
      };

      let saved;
      if (initial && (initial._id || initial.id)) {
        const id = initial._id || initial.id;
        saved = await API.unwrap(API.put(`/admit-cards/${id}`, payload));
      } else {
        saved = await API.unwrap(API.post('/admit-cards', payload));
      }

      onSaved(saved);
    } catch (err) {
      console.error('save admit card error:', err);
      setError(err.userMessage || 'Failed to save admit card');
    } finally {
      setSaving(false);
    }
  };

  return (
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
                {initial ? 'Edit Admit Card' : 'Create Admit Card'}
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

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Enrollment Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Roll Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Course (optional)</label>
                  <select
                    className="form-select"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  >
                    <option value="">No specific course</option>
                    {courses.map((c) => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.name || c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Exam Center</label>
                  <input
                    type="text"
                    className="form-control"
                    value={examCenter}
                    onChange={(e) => setExamCenter(e.target.value)}
                    placeholder="Center name and address"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Exam Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Exam Time *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    placeholder="e.g. 10:00 AM – 12:00 PM"
                    required
                  />
                </div>
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
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdmitCardList() {
  const [cards, setCards] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    setMsg('');
    try {
      const [cardsData, coursesData] = await Promise.all([
        API.unwrap(API.get('/admit-cards')),
        API.unwrap(API.get('/courses')),
      ]);

      const cardArr = Array.isArray(cardsData)
        ? cardsData
        : Array.isArray(cardsData?.data)
        ? cardsData.data
        : [];

      const courseArr = Array.isArray(coursesData)
        ? coursesData
        : Array.isArray(coursesData?.data)
        ? coursesData.data
        : [];

      setCards(cardArr);
      setCourses(courseArr);
    } catch (err) {
      console.error('fetch admit cards', err);
      setMsg(err.userMessage || 'Failed to load admit cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredCards = useMemo(() => {
    if (!search.trim()) return cards;
    const s = search.trim().toLowerCase();
    return cards.filter((c) => {
      return (
        (c.enrollmentNumber || '').toLowerCase().includes(s) ||
        (c.rollNumber || '').toLowerCase().includes(s) ||
        (c.courseName || '').toLowerCase().includes(s) ||
        (c.examCenter || '').toLowerCase().includes(s)
      );
    });
  }, [cards, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admit card?')) return;
    try {
      await API.delete(`/admit-cards/${id}`);
      setCards((prev) => prev.filter((c) => (c._id || c.id) !== id));
      setMsg('Admit card deleted.');
    } catch (err) {
      console.error('delete admit card error:', err);
      setMsg(err.userMessage || 'Failed to delete admit card');
    }
  };

  const handleEdit = (card) => {
    setEditing(card);
    setShowModal(true);
  };

  const handleSaved = (saved) => {
    if (!saved || !saved._id) {
      setShowModal(false);
      loadAll();
      return;
    }

    setCards((prev) => {
      const idx = prev.findIndex((c) => (c._id || c.id) === (saved._id || saved.id));
      if (idx === -1) return [saved, ...prev];
      const copy = [...prev];
      copy[idx] = saved;
      return copy;
    });

    setShowModal(false);
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="flex-grow-1">
        <div className="container-fluid p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h2 className="mb-0">Admit Cards</h2>
              <div className="small text-muted">
                List, search, edit and delete admit cards
              </div>
            </div>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                style={{ maxWidth: 240 }}
                placeholder="Search by enrollment / roll / course"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={loadAll}
                disabled={loading}
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>

          {msg && <div className="alert alert-info">{msg}</div>}

          <div className="card shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="p-4 text-center text-muted">
                  Loading admit cards…
                </div>
              ) : filteredCards.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  No admit cards found.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-primary">
                      <tr>
                        <th>Enrollment No.</th>
                        <th>Roll No.</th>
                        <th>Course</th>
                        <th>Exam Center</th>
                        <th>Exam Date</th>
                        <th>Exam Time</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCards.map((c) => (
                        <tr key={c._id || c.id}>
                          <td>{c.enrollmentNumber}</td>
                          <td>{c.rollNumber}</td>
                          <td>{c.courseName || '-'}</td>
                          <td>{c.examCenter || '-'}</td>
                          <td>{fmtDate(c.examDate)}</td>
                          <td>{c.examTime || '-'}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(c)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(c._id || c.id)
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

          {/* <div className="mt-3 small text-muted">
            This page calls <code>GET /admit-cards</code> for the list and uses{' '}
            <code>PUT /admit-cards/:id</code> and{' '}
            <code>DELETE /admit-cards/:id</code> for editing and deleting
            records.
          </div> */}
        </div>
      </div>

      <AdmitCardModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initial={editing}
        courses={courses}
      />
    </div>
  );
}
