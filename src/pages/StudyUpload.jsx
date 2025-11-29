// src/pages/StudyUpload.jsx
import { useEffect, useState } from "react";
import API from "../api/api";

// Try to derive API origin (http://localhost:5000) from axios baseURL
let API_ORIGIN = "";
try {
  const base = API?.defaults?.baseURL || "";
  if (base) {
    API_ORIGIN = new URL(base).origin; // e.g. http://localhost:5000
  } else if (typeof window !== "undefined") {
    API_ORIGIN = window.location.origin;
  }
} catch {
  if (typeof window !== "undefined") {
    API_ORIGIN = window.location.origin;
  }
}

// Build a file URL from whatever backend stores
function getFileUrl(item) {
  if (!item) return "";

  // Explicit URL fields
  if (item.fileUrl) return item.fileUrl;
  if (item.url) return item.url;

  // File-name based (stored in uploads)
  const fname =
    item.fileName ||
    item.filename ||
    item.file ||
    item.path ||
    item.storageName ||
    "";

  if (!fname) return "";

  if (fname.startsWith("http://") || fname.startsWith("https://")) {
    return fname;
  }

  // assume relative to /uploads
  return `${API_ORIGIN}/uploads/${fname.replace(/^uploads[\\/]/, "")}`;
}

const TYPE_OPTIONS = [
  "PDF",
  "PowerPoint",
  "Word",
  "Link",
  "Notes",
  "Other",
];

export default function StudyUpload() {
  const [description, setDescription] = useState("");
  const [type, setType] = useState("PDF");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState(null);

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info"); // info | success | danger

  // Fetch all study materials
  const loadAll = async () => {
    setLoading(true);
    setMsg("");
    try {
      const data = await API.unwrap(API.get("/study-materials"));
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setMaterials(arr);
    } catch (err) {
      console.error("load study materials", err);
      setMsgType("danger");
      setMsg(err.userMessage || "Failed to load study materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const validate = () => {
    if (!description.trim()) {
      setMsgType("danger");
      setMsg("Description is required.");
      return false;
    }

    if (!file && !linkUrl.trim()) {
      setMsgType("danger");
      setMsg("Either upload a file or provide a link URL.");
      return false;
    }

    if (linkUrl && !/^https?:\/\//i.test(linkUrl.trim())) {
      setMsgType("danger");
      setMsg("Link URL must start with http:// or https://");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!validate()) return;

    setSaving(true);
    try {
      const form = new FormData();
      form.append("description", description.trim());
      form.append("type", type || "PDF");
      if (linkUrl.trim()) form.append("linkUrl", linkUrl.trim());
      if (file) form.append("file", file); // field name must match multer.single('file')

      await API.post("/study-materials", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsgType("success");
      setMsg("Study material uploaded successfully.");

      // reset form
      setDescription("");
      setType("PDF");
      setLinkUrl("");
      setFile(null);

      await loadAll();
    } catch (err) {
      console.error("upload study material", err);
      setMsgType("danger");
      setMsg(err.userMessage || "Failed to upload study material");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this study material?")) return;
    setMsg("");
    try {
      await API.delete(`/study-materials/${id}`);
      setMaterials((prev) => prev.filter((m) => (m._id || m.id) !== id));
      setMsgType("success");
      setMsg("Deleted.");
    } catch (err) {
      console.error("delete study material", err);
      setMsgType("danger");
      setMsg(err.userMessage || "Delete failed");
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="flex-grow-1">
        <div className="container-fluid p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h2 className="mb-0">Study Material – Upload</h2>
              <div className="small text-muted">
                Upload files or add links for students
              </div>
            </div>
            <button
              className="btn btn-outline-secondary"
              onClick={loadAll}
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh List"}
            </button>
          </div>

          {msg && (
            <div
              className={`alert alert-${
                msgType === "danger"
                  ? "danger"
                  : msgType === "success"
                  ? "success"
                  : "info"
              }`}
            >
              {msg}
            </div>
          )}

          {/* Upload form */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <form className="row g-3" onSubmit={handleSubmit}>
                <div className="col-md-6">
                  <label className="form-label">Description *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. HTML Basics Notes"
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Link URL (optional)</label>
                  <input
                    type="url"
                    className="form-control"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com/material.pdf"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Upload file (Word / PDF / PPT) – optional if link provided
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.pptm,.pps,.ppsx"
                    onChange={handleFileChange}
                  />
                  <div className="small text-muted mt-1">
                    Recommended size &lt; 10 MB.
                  </div>
                </div>

                <div className="col-md-3 d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={saving}
                  >
                    {saving ? "Uploading…" : "Upload"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Quick inline list (for convenience) */}
          <div className="card shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="p-4 text-center text-muted">
                  Loading study materials…
                </div>
              ) : materials.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  No study materials uploaded yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-primary">
                      <tr>
                        <th>Description</th>
                        <th>Type</th>
                        <th>File / Link</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((m) => {
                        const id = m._id || m.id;
                        const fileUrl = getFileUrl(m);
                        const hasLink = !!(m.linkUrl || m.url);
                        return (
                          <tr key={id}>
                            <td>{m.description || m.title || "-"}</td>
                            <td>{m.type || "-"}</td>
                            <td>
                              {hasLink && (
                                <a
                                  href={m.linkUrl || m.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Open link
                                </a>
                              )}
                              {hasLink && fileUrl && " | "}
                              {fileUrl && (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Download file
                                </a>
                              )}
                              {!hasLink && !fileUrl && (
                                <span className="text-muted">None</span>
                              )}
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 small text-muted">
            This page uses <code>GET /study-materials</code>,{" "}
            <code>POST /study-materials</code> and{" "}
            <code>DELETE /study-materials/:id</code>. Make sure your backend
            routes match these paths.
          </div>
        </div>
      </div>
    </div>
  );
}
