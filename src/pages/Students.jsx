// src/pages/Students.jsx
import { useEffect, useState } from 'react';
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
  const navigate = useNavigate();

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await API.unwrap(API.get('/students'));
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchStudents:', err);
      setError(err.userMessage || 'Failed to fetch students');
      // if unauthorized, navigate to login
      if (err?.response?.status === 401 || !localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error('delete student:', err);
      setError(err.userMessage || 'Failed to delete student');
    }
  };

  const handleEdit = (student) => {
    // route to an edit page if you create one
    // navigate(`/students/${student._id}`)
    alert(`Edit student: ${student.name}`);
  };

  const handleAdd = (newStudent) => {
    setStudents((prev) => [newStudent, ...prev]);
    setShowModal(false);
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />

        <div className="container-fluid p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">Students</h2>
            <div>
              <button className="btn btn-outline-secondary me-2" onClick={fetchStudents}>Refresh</button>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Student</button>
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
                <StudentTable students={students} onEdit={handleEdit} onDelete={handleDelete} />
              )}
            </div>
          </div>

          {!loading && students.length === 0 && (
            <div className="text-center mt-4 text-muted">No students yet.</div>
          )}
        </div>
      </div>

      {showModal && <AddStudentModal show={showModal} onClose={() => setShowModal(false)} onAdded={handleAdd} />}
    </div>
  );
}
