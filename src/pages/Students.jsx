// src/pages/Students.jsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import StudentTable from '../components/StudentTable';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AddStudentModal from '../components/AddStudentModal';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const navigate = useNavigate();

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await API.unwrap(API.get('/students'));
      const arr = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      setStudents(arr);
    } catch (err) {
      console.error('fetchStudents:', err);
      setError(err.userMessage || 'Failed to fetch students');

      if (err?.response?.status === 401) {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        } catch (_) {}
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await API.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => (s._id || s.id) !== id));
    } catch (err) {
      console.error('delete student:', err);
      setError(err.userMessage || 'Failed to delete student');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingStudent(null);
    setShowModal(true);
  };

  const handleSaved = (saved) => {
    setStudents((prev) => {
      const id = saved._id || saved.id;
      const idx = prev.findIndex((s) => (s._id || s.id) === id);
      if (idx === -1) {
        return [saved, ...prev];
      }
      const copy = [...prev];
      copy[idx] = saved;
      return copy;
    });
  };

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const term = search.trim().toLowerCase();
    return students.filter((s) => {
      return (
        (s.name && s.name.toLowerCase().includes(term)) ||
        (s.rollNo && s.rollNo.toLowerCase().includes(term)) ||
        (s.email && s.email.toLowerCase().includes(term))
      );
    });
  }, [students, search]);

  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />

        <div className="container-fluid p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <h2 className="fw-bold mb-0">Students</h2>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by name, roll no, or email"
                style={{ minWidth: 220 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={fetchStudents}
                disabled={loading}
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
              <button className="btn btn-primary" onClick={handleAddClick}>
                Add Student
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
                <div className="p-4 text-center">Loading students...</div>
              ) : (
                <StudentTable
                  students={filteredStudents}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>

          {!loading && students.length === 0 && (
            <div className="text-center mt-4 text-muted">No students yet.</div>
          )}
        </div>
      </div>

      {showModal && (
        <AddStudentModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
          editingStudent={editingStudent}
        />
      )}
    </div>
  );
}
