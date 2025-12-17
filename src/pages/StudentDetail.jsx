// src/pages/StudentDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from "../api/axiosInstance";

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // add-result form
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState(1);
  const [marks, setMarks] = useState('');
  const [msg, setMsg] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const s = await API.unwrap(API.get(`/students/${id}`));
      setStudent(s);
      const r = await API.unwrap(API.get(`/results/student/${id}`));
      setResults(Array.isArray(r) ? r : []);
    } catch (err) {
      console.error('student detail fetch', err);
      setMsg(err.userMessage || 'Failed to fetch student');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [id]);

  const addResult = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const payload = { studentId: id, course, semester: Number(semester), marks: Number(marks) };
      const created = await API.unwrap(API.post('/results', payload));
      setMsg('Result added.');
      setCourse(''); setSemester(1); setMarks('');
      // prepend
      setResults(prev => [created, ...prev]);
    } catch (err) {
      console.error('add result', err);
      setMsg(err.userMessage || 'Failed to add result');
    }
  };

  return (
    <div className="d-flex">
      <div className="flex-grow-1">
        <div className="p-4">
          <h2>Student details</h2>
          {msg && <div className="alert alert-info">{msg}</div>}
          {loading ? <div>Loading...</div> : student && (
            <>
              <div className="card mb-4 p-3">
                <h4>{student.name} <small className="text-muted">({student.rollNo})</small></h4>
                <div><strong>Course:</strong> {student.course?.title || student.course || '—'}</div>
                <div><strong>Semester:</strong> {student.semester}</div>
                <div><strong>Email:</strong> {student.email || '—'}</div>
                <div><strong>Contact:</strong> {student.contact || '—'}</div>
                <div><strong>Fees paid:</strong> {student.feesPaid ? 'Yes' : 'No'}</div>
              </div>

              <div className="card mb-4 p-3">
                <h5>Add Result</h5>
                <form onSubmit={addResult} style={{ maxWidth: 600 }}>
                  <div className="mb-2">
                    <label className="form-label">Course</label>
                    <input value={course} onChange={(e)=>setCourse(e.target.value)} className="form-control" required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Semester</label>
                    <input type="number" value={semester} onChange={(e)=>setSemester(e.target.value)} className="form-control" min="1" required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Marks</label>
                    <input type="number" value={marks} onChange={(e)=>setMarks(e.target.value)} className="form-control" min="0" max="100" required />
                  </div>
                  <button className="btn btn-primary" type="submit">Add Result</button>
                </form>
              </div>

              <div className="card p-3">
                <h5>Results</h5>
                {results.length === 0 ? <div className="text-muted">No results yet</div> : (
                  <table className="table">
                    <thead><tr><th>Exam</th><th>Course</th><th>Sem</th><th>Marks</th><th>Declared</th></tr></thead>
                    <tbody>
                      {results.map(r => (
                        <tr key={r._id}>
                          <td>{r.exam || '-'}</td>
                          <td>{(r.course && r.course.title) || r.course || '-'}</td>
                          <td>{r.semester}</td>
                          <td>{r.marks}</td>
                          <td>{r.declared ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
