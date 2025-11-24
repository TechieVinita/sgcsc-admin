// src/pages/AddResults.jsx
import { useEffect, useState } from 'react';
import API from '../api/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function AddResults() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [marks, setMarks] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await API.unwrap(API.get('/students'));
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('fetch students', err);
        setMessage(err.userMessage || 'Failed to load students');
      }
    };
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // Backend route should be POST /results (standardized)
      const payload = { studentId, course, semester: Number(semester), marks: Number(marks) };
      const created = await API.unwrap(API.post('/results', payload));
      setMessage('Result added successfully!');
      setCourse('');
      setSemester('');
      setMarks('');
      setStudentId('');
    } catch (err) {
      console.error('add result', err);
      setMessage(err.userMessage || 'Failed to add result');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />
        <div className="p-4">
          <h2 className="mb-4">Add Result</h2>
          {message && <div className="alert alert-info">{message}</div>}
          <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
            <div className="mb-3">
              <label className="form-label">Student</label>
              <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Course</label>
              <input type="text" className="form-control" value={course} onChange={(e) => setCourse(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Semester</label>
              <input type="number" className="form-control" value={semester} onChange={(e) => setSemester(e.target.value)} min="1" required />
            </div>

            <div className="mb-3">
              <label className="form-label">Marks</label>
              <input type="number" className="form-control" value={marks} onChange={(e) => setMarks(e.target.value)} min="0" max="100" required />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Saving...' : 'Add Result'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
