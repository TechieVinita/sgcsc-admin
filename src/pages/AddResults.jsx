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

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await API.get('/students');
      setStudents(res.data);
    };
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/results/add', { studentId, course, semester, marks });
      setMessage('Result added successfully!');
      setCourse('');
      setSemester('');
      setMarks('');
      setStudentId('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add result');
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
              <select
                className="form-select"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Course</label>
              <input
                type="text"
                className="form-control"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Semester</label>
              <input
                type="number"
                className="form-control"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                min="1"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Marks</label>
              <input
                type="number"
                className="form-control"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                min="0"
                max="100"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Add Result
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
