// src/App.jsx
import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const StudentDetail = lazy(() => import('./pages/StudentDetail'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AddResults = lazy(() => import('./pages/AddResults'));
const ResultsList = lazy(() => import('./pages/ResultsList'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const Courses = lazy(() => import('./pages/Courses'));
const Franchise = lazy(() => import('./pages/Franchise'));
const MarksheetTemplates = lazy(() => import('./pages/MarksheetTemplates'));

// Website content management pages
const Affiliations = lazy(() => import('./pages/Affiliations'));
const Members = lazy(() => import('./pages/Members'));

// Dev sample image (if you still need it elsewhere)
export const DEV_SAMPLE_IMAGE =
  '/mnt/data/58e83842-f724-41ef-b678-0d3ad1e30ed8.png';

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
  // check both token keys that might be used by different parts of your app
  const adminToken =
    typeof window !== 'undefined'
      ? localStorage.getItem('admin_token')
      : null;
  const userToken =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAuthenticated = Boolean(adminToken || userToken);

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected admin routes */}
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

          {/* Website content management (with Sidebar + Navbar in the page components) */}
          <Route
            path="/affiliations"
            element={
              <PrivateRoute>
                <Affiliations />
              </PrivateRoute>
            }
          />

          <Route
            path="/members"
            element={
              <PrivateRoute>
                <Members />
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
                  localStorage.removeItem('admin_token');
                  localStorage.removeItem('admin_user');
                }
                return <Navigate to="/login" replace />;
              })()
            }
          />

          {/* Root redirect - if authenticated send to dashboard otherwise to login */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="text-center mt-20">
                <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
                <p className="text-muted">
                  The page you requested doesn&apos;t exist.
                </p>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}
