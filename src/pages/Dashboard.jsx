// src/pages/Dashboard.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../api/api";

// Format date exactly like StudentTable
function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("en-IN");
}

// Safe date → timestamp for sorting
function toTime(d) {
  if (!d) return 0;
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? 0 : t;
}

// Derive base URL from axios instance, fall back to /api
const API_BASE =
  (API && API.defaults && API.defaults.baseURL) || "/api";

// Small helper to call backend WITHOUT using axios interceptors
async function fetchJSON(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(
      `Request failed: ${res.status} ${res.statusText || ""}`.trim()
    );
    err.status = res.status;
    err.body = text;
    throw err;
  }

  const json = await res.json().catch(() => ({}));
  return json?.data ?? json;
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
  const [error, setError] = useState("");

  // Central data loader – reused on mount + Refresh button
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("admin_token") ||
      "";

    try {
      const [studentsRes, coursesRes, resultsRes, franchisesRes] =
        await Promise.allSettled([
          fetchJSON("/students", token),
          fetchJSON("/courses", token),
          fetchJSON("/results", token),
          fetchJSON("/franchises", token), // will just fail quietly if you don't have this yet
        ]);

      const newCounts = {
        students: 0,
        courses: 0,
        results: 0,
        franchises: 0,
      };

      // ---- Students ----
      if (studentsRes.status === "fulfilled") {
        const list = Array.isArray(studentsRes.value)
          ? studentsRes.value
          : [];
        newCounts.students = list.length;
        setRecentStudents(list);
      }

      // ---- Courses ----
      if (coursesRes.status === "fulfilled") {
        const list = Array.isArray(coursesRes.value)
          ? coursesRes.value
          : [];
        newCounts.courses = list.length;
      }

      // ---- Results ----
      if (resultsRes.status === "fulfilled") {
        const list = Array.isArray(resultsRes.value)
          ? resultsRes.value
          : [];
        newCounts.results = list.length;
      }

      // ---- Franchises ----
      if (franchisesRes.status === "fulfilled") {
        const list = Array.isArray(franchisesRes.value)
          ? franchisesRes.value
          : [];
        newCounts.franchises = list.length;
      }

      setCounts(newCounts);
    } catch (err) {
      console.warn("dashboard loadAll error:", err);
      setError(
        "Some data could not be loaded. Check your backend endpoints and authentication."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Recent students: sort by joinDate/createdAt DESC, then top 6
  const formattedRecentStudents = useMemo(() => {
    const mapped = (recentStudents || []).map((s) => ({
      id: s._id || s.id || Math.random().toString(36).slice(2, 8),
      name: s.name || s.fullName || s.rollNo || "Unknown",
      rollNo: s.rollNo || s.registrationNumber || "-",
      email: s.email || "-",
      joinedAt: s.joinDate || s.createdAt || s.created || "",
    }));

    mapped.sort((a, b) => toTime(b.joinedAt) - toTime(a.joinedAt));
    return mapped.slice(0, 6);
  }, [recentStudents]);

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  return (
    <div className="bg-light min-vh-100">
      <div className="container-fluid p-4">
        {/* Header + actions */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h1 className="mb-0 h3">Admin Dashboard</h1>
            <div className="small text-muted">
              Overview — quick actions and recent activity
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={loadAll}
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => handleNavigate("/students")}
            >
              Manage Students
            </button>
          </div>
        </div>

        {error && <div className="alert alert-warning">{error}</div>}

        {/* Summary cards – all same style */}
        <div className="row gx-3 gy-3">
          {[
            { key: "students", label: "Students" },
            { key: "courses", label: "Courses" },
            { key: "results", label: "Results" },
            { key: "franchises", label: "Franchises" },
          ].map((item) => (
            <div key={item.key} className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column justify-content-center">
                  <div className="small text-muted">{item.label}</div>
                  <div className="display-6 fw-semibold">
                    {loading ? "—" : counts[item.key]}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Students only */}
        <div className="row mt-4 gx-3 gy-3">
          <div className="col-12">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Recent Students</h5>
                  <small className="text-muted">Latest registered</small>
                </div>

                {formattedRecentStudents.length === 0 ? (
                  <div className="text-muted">
                    No recent students to show.
                  </div>
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
                            <td className="text-muted">
                              {fmtDate(s.joinedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* footer quick tips */}
        <div className="mt-4 text-muted small">
          Tip: use the buttons at the top to quickly reach management screens.
          If an endpoint fails to respond, check your backend routes
          (/students, /courses, /results, /franchises) and ensure the API
          server is running.
        </div>
      </div>
    </div>
  );
}
