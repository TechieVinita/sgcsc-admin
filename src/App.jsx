import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import ResetPassword from './pages/ResetPassword';
import AddResults from './pages/AddResults';
import PrivateRoute from './components/PrivateRoute';

import GalleryPage from "./pages/GalleryPage";


export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login onLogin={setToken} />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/students" element={<PrivateRoute><Students /></PrivateRoute>} />
        <Route path="/add-result" element={<PrivateRoute><AddResults /></PrivateRoute>} />
        <Route path="/gallery" element={<PrivateRoute><GalleryPage /></PrivateRoute>} />


        {/* 404 fallback */}
        <Route path="*" element={
          <div className="text-center mt-20">
            <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
          </div>
        } />
      </Routes>
    </Router>
  );
}
