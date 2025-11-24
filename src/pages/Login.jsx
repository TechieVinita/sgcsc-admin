// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/admin-login', { email, password });
      // token may be at res.data.token or inside { token, user }
      const token = res?.data?.token ?? res?.data?.data?.token;
      if (!token) throw new Error('No token returned from server');

      // Save token
      localStorage.setItem('token', token);
      if (onLogin) onLogin(token);

      // Try to fetch the admin user object
      const user = await API.getAuthUser();
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.userMessage || err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-5" style={{ width: '380px', borderRadius: '1.5rem', border: 'none' }}>
        <div className="text-center mb-4">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: '70px', height: '70px', fontSize: '28px', fontWeight: 'bold', boxShadow: '0 6px 15px rgba(0,0,0,0.2)' }}
          >
            A
          </div>
          <h3 className="fw-bold text-dark">Admin Login</h3>
        </div>

        {error && <div className="alert alert-danger text-center py-2">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">Email</label>
            <input
              type="email"
              id="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control form-control-lg shadow-sm"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold">Password</label>
            <input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control form-control-lg shadow-sm"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 btn-lg fw-bold shadow-sm"
            style={{ transition: 'all 0.2s', letterSpacing: '0.5px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-muted mt-4 mb-0" style={{ fontSize: '0.9rem' }}>
          Forgot your password?{' '}
          <span
            onClick={() => navigate('/reset-password')}
            className="text-primary fw-bold"
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            Reset it
          </span>
        </p>
      </div>
    </div>
  );
}
