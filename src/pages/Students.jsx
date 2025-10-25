import { useEffect, useState } from 'react';
import API from '../api/api';
import StudentTable from '../components/StudentTable';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AddStudentModal from '../components/AddStudentModal'; // Import modal

export default function Students() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // Modal hidden by default

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not logged in');
          return;
        }

        const res = await API.get('/students', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStudents(res.data || []);
        setError('');
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch students');
      }
    };

    fetchStudents();
  }, []);

  // Delete student
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      await API.delete(`/students/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStudents((prev) => prev.filter((s) => s._id !== id));
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete student');
    }
  };

  // Edit student
  const handleEdit = (student) => {
    alert(`Edit student: ${student.name}`);
  };

  // Add student callback
  const handleAdd = (newStudent) => {
    setStudents((prev) => [...prev, newStudent]);
    setShowModal(false); // close modal after adding
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />

        <div className="container-fluid p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">Students</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)} // Open modal on click
            >
              Add Student
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-body p-0">
              <StudentTable
                students={students}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Render AddStudentModal only when showModal is true */}
      {showModal && (
        <AddStudentModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onAdded={handleAdd}
        />
      )}
    </div>
  );
}
