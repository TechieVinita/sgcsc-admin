import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import API from '../api/api';

// DEV logo / sample image you uploaded (replace with real asset url in production)
const DEV_LOGO = '/mnt/data/58e83842-f724-41ef-b678-0d3ad1e30ed8.png';

// small helper: format date
function fmtDate(d) {
  if (!d) return '-';
  const dt = new Date(d);
  return dt.toLocaleDateString();
}

// tiny SVG sparkline (no external deps)
function Sparkline({ values = [], width = 120, height = 36 }) {
  if (!values || values.length === 0) {
    return <svg width={width} height={height}><text x="6" y={height / 2} fontSize="9" fill="#999">no data</text></svg>;
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / Math.max(1, values.length - 1);
  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke="#1e7be7" strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    students: 0,
    courses: 0,
    results: 0,
    franchises: 0,
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [error, setError] = useState('');

  // lightweight in-memory trend data so sparklines can show something
  const [trends, setTrends] = useState({
    students: [3, 6, 9, 12, 18, 20, 24],
    results: [2, 5, 7, 9, 8, 10, 12],
  });

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token'); // Private API is protected

    async function loadAll() {
      setLoading(true);
      setError('');

      try {
        // Attempt to fetch multiple resources in parallel.
        // Use API.unwrap when possible to normalize result shapes.
        const calls = [
          API.unwrap(API.get('/students')).catch((e) => { throw { source: 'students', e }; }),
          API.unwrap(API.get('/courses')).catch((e) => { throw { source: 'courses', e }; }),
          API.unwrap(API.get('/results')).catch((e) => { throw { source: 'results', e }; }),
          API.unwrap(API.get('/franchises')).catch((e) => { throw { source: 'franchises', e }; }),
        ];

        // run in parallel and do resilient handling
        const results = await Promise.allSettled(calls);

        const newCounts = { students: 0, courses: 0, results: 0, franchises: 0 };

        // students
        if (results[0].status === 'fulfilled' && Array.isArray(results[0].value)) {
          newCounts.students = results[0].value.length;
          if (mounted) setRecentStudents(results[0].value.slice(0, 6));
        } else {
          // try to extract if API returned object with data array
          try {
            const val = results[0].status === 'fulfilled' ? results[0].value : null;
            if (val && val.data && Array.isArray(val.data)) {
              newCounts.students = val.data.length;
            }
          } catch (e) {}
        }

        // courses
        if (results[1].status === 'fulfilled' && Array.isArray(results[1].value)) {
          newCounts.courses = results[1].value.length;
        }

        // results
        if (results[2].status === 'fulfilled' && Array.isArray(results[2].value)) {
          newCounts.results = results[2].value.length;
          if (mounted) setRecentResults(results[2].value.slice(0, 6));
        }

        // franchises
        if (results[3].status === 'fulfilled' && Array.isArray(results[3].value)) {
          newCounts.franchises = results[3].value.length;
        }

        if (mounted) setCounts(newCounts);

        // optional: update sparkline sample data from live counts if available
        if (mounted) {
          setTrends((t) => ({
            students: [...t.students.slice(-6), newCounts.students],
            results: [...t.results.slice(-6), newCounts.results],
          }));
        }
      } catch (err) {
        // If any single fetch threw a structured error
        console.warn('partial load error', err);
        if (mounted) setError('Some data could not be loaded (check server endpoints).');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // if no token we can still try to call public endpoints — but keep message
    if (!token) {
      setError('You are not logged in. Some admin-only stats may be unavailable.');
      // still attempt public endpoints
    }

    loadAll();
    return () => { mounted = false; };
  }, []);

  // convert recent students to a simple table row shape
  const formattedRecentStudents = useMemo(() => {
    return (recentStudents || []).map((s) => ({
      id: s._id || s.id || Math.random().toString(36).slice(2, 8),
      name: s.name || s.fullName || s.rollNo || 'Unknown',
      rollNo: s.rollNo || s.registrationNumber || '-',
      email: s.email || '-',
      createdAt: s.createdAt || s.created || '',
    }));
  }, [recentStudents]);

  const formattedRecentResults = useMemo(() => {
    return (recentResults || []).map((r) => ({
      id: r._id || Math.random().toString(36).slice(2, 8),
      studentName: (r.studentId && (r.studentId.name || r.studentId)) || r.studentName || 'Student',
      course: r.course || r.exam || '-',
      marks: r.marks ?? r.marksObtained ?? '-',
      date: r.date || r.createdAt || '',
    }));
  }, [recentResults]);

  // quick navigation actions (route names depend on your admin app routes)
  const handleNavigate = (path) => {
    window.location.href = path; // simple - will load admin panel route
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar />

      <div className="flex-grow-1">
        <Navbar />

        <div className="container-fluid p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1 className="mb-0 h3">Admin Dashboard</h1>
              <div className="small text-muted">Overview — quick actions and recent activity</div>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={() => window.location.reload()}>Refresh</button>
              <button className="btn btn-outline-primary" onClick={() => handleNavigate('/students')}>Manage Students</button>
              <button className="btn btn-outline-success" onClick={() => handleNavigate('/add-result')}>Add Result</button>
            </div>
          </div>

          {error && <div className="alert alert-warning">{error}</div>}

          <div className="row gx-3 gy-3">
            {/* Summary cards */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex align-items-center gap-3">
                  <div style={{ width: 64, height: 64, borderRadius: 10, background: '#f0f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={DEV_LOGO} alt="logo" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} />
                  </div>
                  <div>
                    <div className="small text-muted">Students</div>
                    <div className="h4 mb-0">{loading ? '—' : counts.students}</div>
                    <div className="small text-muted mt-1 d-flex align-items-center">
                      <Sparkline values={trends.students} />
                      <span className="ms-2">trend</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex align-items-center gap-3">
                  <div style={{ width: 64, height: 64, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-book-half fs-3 text-warning"></i>
                  </div>
                  <div>
                    <div className="small text-muted">Courses</div>
                    <div className="h4 mb-0">{loading ? '—' : counts.courses}</div>
                    <div className="small text-muted mt-1">Manage course catalog</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex align-items-center gap-3">
                  <div style={{ width: 64, height: 64, borderRadius: 10, background: '#f6ffed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-file-earmark-text-fill fs-3 text-success"></i>
                  </div>
                  <div>
                    <div className="small text-muted">Results</div>
                    <div className="h4 mb-0">{loading ? '—' : counts.results}</div>
                    <div className="small text-muted mt-1">
                      <Sparkline values={trends.results} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex align-items-center gap-3">
                  <div style={{ width: 64, height: 64, borderRadius: 10, background: '#fff0f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-people-fill fs-3 text-danger"></i>
                  </div>
                  <div>
                    <div className="small text-muted">Franchises</div>
                    <div className="h4 mb-0">{loading ? '—' : counts.franchises}</div>
                    <div className="small text-muted mt-1">pending approvals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="row mt-4 gx-3 gy-3">
            <div className="col-12 col-lg-7">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Recent Students</h5>
                    <small className="text-muted">Latest registered</small>
                  </div>

                  {formattedRecentStudents.length === 0 ? (
                    <div className="text-muted">No recent students to show.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-borderless table-hover align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Roll No</th>
                            <th>Email</th>
                            <th>Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formattedRecentStudents.map((s) => (
                            <tr key={s.id}>
                              <td className="fw-semibold">{s.name}</td>
                              <td className="text-muted">{s.rollNo}</td>
                              <td className="text-muted">{s.email}</td>
                              <td className="text-muted">{fmtDate(s.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Recent Results</h5>
                    <small className="text-muted">Latest entries</small>
                  </div>

                  {formattedRecentResults.length === 0 ? (
                    <div className="text-muted">No recent results to show.</div>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {formattedRecentResults.map((r) => (
                        <li className="list-group-item d-flex justify-content-between align-items-start" key={r.id}>
                          <div>
                            <div className="fw-semibold">{r.studentName}</div>
                            <div className="small text-muted">{r.course}</div>
                          </div>
                          <div className="text-end">
                            <div className="fw-semibold">{r.marks}</div>
                            <div className="small text-muted">{fmtDate(r.date)}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* footer quick tips */}
          <div className="mt-4 text-muted small">
            Tip: use the buttons at the top to quickly reach management screens. If an endpoint fails to respond,
            check your backend routes (/students, /courses, /results, /franchises) and ensure the API server is running.
          </div>
        </div>
      </div>
    </div>
  );
}
