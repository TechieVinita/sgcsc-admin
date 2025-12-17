// src/pages/Members.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

const emptyMember = {
  name: "",
  designation: "",
  isActive: true,
};

export default function Members() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // member being edited
  const [form, setForm] = useState(emptyMember);

  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await API.unwrap(API.get("/members"));
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];
      setMembers(arr);
    } catch (err) {
      console.error("fetchMembers error:", err);
      setError(err.userMessage || "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEditModal = (member) => {
    setEditing(member);
    setForm({
      name: member.name || "",
      designation: member.designation || "",
      isActive: member.isActive !== false,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyMember);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this member?")) return;
    try {
      await API.delete(`/members/${id}`);
      setMembers((prev) => prev.filter((m) => (m._id || m.id) !== id));
    } catch (err) {
      console.error("delete member error:", err);
      setError(err.userMessage || "Failed to delete member");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing) return; // only edit from here

    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      designation: form.designation.trim(),
      isActive: !!form.isActive,
    };

    try {
      const saved = await API.unwrap(
        API.put(`/members/${editing._id || editing.id}`, payload)
      );

      setMembers((prev) =>
        prev.map((m) =>
          (m._id || m.id) === (editing._id || editing.id) ? saved : m
        )
      );

      closeModal();
    } catch (err) {
      console.error("save member error:", err);
      setError(err.userMessage || "Failed to save member");
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = useMemo(() => {
    const list = members || [];
    const term = search.trim().toLowerCase();

    const filtered = term
      ? list.filter((m) => {
          const name = (m.name || "").toLowerCase();
          const designation = (m.designation || "").toLowerCase();
          return name.includes(term) || designation.includes(term);
        })
      : list;

    // Simple sort: by name
    return [...filtered].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
  }, [members, search]);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold mb-0">Institute Members</h2>
        <div className="d-flex flex-wrap gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ minWidth: 220 }}
            placeholder="Search by name or designation"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary"
            onClick={fetchMembers}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/members/add")}
          >
            Add Member
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-center">Loading members…</div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-4 text-center text-muted">
              No members added yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-primary">
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Designation</th>
                    <th scope="col">Active</th>
                    <th scope="col">Updated</th>
                    <th scope="col" className="text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => (
                    <tr key={m._id || m.id}>
                      <td>{m.name}</td>
                      <td>{m.designation || "-"}</td>
                      <td>
                        {m.isActive === false ? (
                          <span className="badge bg-secondary">Hidden</span>
                        ) : (
                          <span className="badge bg-success">Active</span>
                        )}
                      </td>
                      <td>
                        {m.updatedAt
                          ? new Date(m.updatedAt).toLocaleDateString("en-IN")
                          : "-"}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => openEditModal(m)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(m._id || m.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Member</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                    disabled={saving}
                  />
                </div>

                <div className="modal-body">
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        name="designation"
                        value={form.designation}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-3 d-flex align-items-end">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="edit-member-active"
                          name="isActive"
                          checked={form.isActive}
                          onChange={handleChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="edit-member-active"
                        >
                          Show on site
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
