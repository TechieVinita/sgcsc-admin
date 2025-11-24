// src/components/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // send user to login and keep track of where they were going
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // token exists — we allow render. Server will enforce permissions.
  return children;
}
