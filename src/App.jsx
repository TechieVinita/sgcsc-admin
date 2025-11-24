// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

// Lazy-loaded pages (improves initial bundle size)
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const StudentDetail = lazy(() => import('./pages/StudentDetail')); // optional: create if not present
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AddResults = lazy(() => import('./pages/AddResults'));
const ResultsList = lazy(() => import('./pages/ResultsList')); // optional: create if not present
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const Courses = lazy(() => import('./pages/Courses'));
const Franchise = lazy(() => import('./pages/Franchise'));
const MarksheetTemplates = lazy(() => import('./pages/MarksheetTemplates'));

// Dev sample image - you can replace with a cloud URL in production
export const DEV_SAMPLE_IMAGE = '/mnt/data/58e83842-f724-41ef-b678-0d3ad1e30ed8.png';

function LoadingFallback() {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="text-center">
        <div className="spinner-border" role="status" aria-hidden="true" />
        <div className="mt-2">Loading...</div>
      </div>
    </div>
  );
}

export default function App() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/students"
            element={
              <PrivateRoute>
                <Students />
              </PrivateRoute>
            }
          />

          {/* Student details (view / add result from student profile) */}
          <Route
            path="/students/:id"
            element={
              <PrivateRoute>
                <StudentDetail />
              </PrivateRoute>
            }
          />

          <Route
            path="/results"
            element={
              <PrivateRoute>
                <ResultsList />
              </PrivateRoute>
            }
          />

          <Route
            path="/add-result"
            element={
              <PrivateRoute>
                <AddResults />
              </PrivateRoute>
            }
          />

          <Route
            path="/gallery"
            element={
              <PrivateRoute>
                <GalleryPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <PrivateRoute>
                <Courses />
              </PrivateRoute>
            }
          />

          <Route
            path="/franchise"
            element={
              <PrivateRoute>
                <Franchise />
              </PrivateRoute>
            }
          />

          <Route
            path="/marksheet-templates"
            element={
              <PrivateRoute>
                <MarksheetTemplates />
              </PrivateRoute>
            }
          />

          {/* Logout route: clears auth and redirects to login */}
          <Route
            path="/logout"
            element={
              (() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  // optionally clear other stored UI state here
                }
                return <Navigate to="/login" replace />;
              })()
            }
          />

          {/* Root redirect - if token exists send to dashboard otherwise to login */}
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="text-center mt-20">
                <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
                <p className="text-muted">The page you requested doesn't exist.</p>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}
