import { useEffect, useState } from "react";
import API from "../api/axiosInstance"; // adjust path if needed

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";


export default function FranchiseApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/franchises?status=pending");
      setApplications(res.data?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    if (!window.confirm("Approve this franchise?")) return;

    try {
      await API.put(`/franchises/${id}/approve`);
      setApplications((prev) => prev.filter((f) => f._id !== id));
    } catch {
      alert("Failed to approve franchise");
    }
  };

  const reject = async (id) => {
    if (!window.confirm("Reject this franchise?")) return;

    try {
      await API.put(`/franchises/${id}/reject`);
      setApplications((prev) => prev.filter((f) => f._id !== id));
    } catch {
      alert("Failed to reject franchise");
    }
  };

return (
  <div className="d-flex">
    {/* SIDEBAR */}
    <Sidebar />

    {/* MAIN CONTENT */}
    <div className="flex-grow-1">
      <Navbar />

      <div className="container-fluid p-4">
        <h2 className="mb-3">Franchise Applications</h2>

        {loading && <p>Loading applications...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && applications.length === 0 && (
          <div className="alert alert-info">
            No pending franchise applications.
          </div>
        )}

        {!loading && applications.length > 0 && (
          <table className="table table-bordered table-hover mt-3">
            {/* table stays SAME */}
          </table>
        )}
      </div>
    </div>
  </div>
);

}
