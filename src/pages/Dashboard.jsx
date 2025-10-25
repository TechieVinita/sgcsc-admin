import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import API from '../api/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalStudents: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not logged in');
          return;
        }

        const res = await API.get('/students');
        setStats({ totalStudents: res.data.length });
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch stats');
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar />

      <div className="flex-grow-1">
        <Navbar />

        <div className="container-fluid p-4">
          <h1 className="mb-4 display-5">Dashboard</h1>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="row g-4">
            {/* Total Students Card */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h5 className="card-title">Total Students</h5>
                  <p className="card-text display-6">{stats.totalStudents}</p>
                </div>
              </div>
            </div>

            {/* Additional Stats Card Example */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h5 className="card-title">Pending Tasks</h5>
                  <p className="card-text display-6">12</p>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h5 className="card-title">Active Users</h5>
                  <p className="card-text display-6">34</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
