// src/pages/ResultsList.jsx
import React, { useEffect, useState } from 'react';
import API from '../api/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function ResultsList() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetch = async () => {
    setLoading(true);
    setMsg('');
    try {
      const data = await API.unwrap(API.get('/results'));
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetch results', err);
      setMsg(err.userMessage || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=> { fetch(); }, []);

  const declare = async (id) => {
    if (!window.confirm('Declare this result (make it visible)?')) return;
    try {
      const updated = await API.unwrap(API.put(`/results/${id}/declare`));
      setResults(prev => prev.map(r => r._id === updated._id ? updated : r));
      setMsg('Declared.');
    } catch (err) {
      console.error('declare', err);
      setMsg(err.userMessage || 'Failed to declare');
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />
        <div className="p-4">
          <h2>Results</h2>
          {msg && <div className="alert alert-info">{msg}</div>}
          {loading ? <div>Loading...</div> : (
            <table className="table table-striped">
              <thead><tr><th>Student</th><th>Course</th><th>Sem</th><th>Marks</th><th>Declared</th><th>Actions</th></tr></thead>
              <tbody>
                {results.map(r => (
                  <tr key={r._id}>
                    <td>{r.student?.name || r.student?.rollNo || '-'}</td>
                    <td>{(r.course && r.course.title) || r.course || '-'}</td>
                    <td>{r.semester}</td>
                    <td>{r.marks}</td>
                    <td>{r.declared ? 'Yes' : 'No'}</td>
                    <td>
                      {!r.declared && <button className="btn btn-sm btn-success me-2" onClick={()=>declare(r._id)}>Declare</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
