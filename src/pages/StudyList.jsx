// src/pages/StudyList.jsx
import { useEffect, useMemo, useState } from "react";
import API from "../api/api";

let API_ORIGIN = "";
try {
  const base = API?.defaults?.baseURL || "";
  if (base) {
    API_ORIGIN = new URL(base).origin;
  } else if (typeof window !== "undefined") {
    API_ORIGIN = window.location.origin;
  }
} catch {
  if (typeof window !== "undefined") {
    API_ORIGIN = window.location.origin;
  }
}

function getFileUrl(item) {
  if (!item) return "";
  if (item.fileUrl) return item.fileUrl;
  if (item.url) return item.url;

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
  return `${API_ORIGIN}/uploads/${fname.replace(/^uploads[\\/]/, "")}`;
}

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("en-IN");
}

export default function StudyList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [search, setSearch] = useState("");

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
      setItems(arr);
    } catch (err) {
      console.error("fetch study materials", err);
      setMsgType("danger");
      setMsg(err.userMessage || "Failed to fetch study materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const s = search.trim().toLowerCase();
    return items.filter((m) => {
      const desc = (m.description || m.title || "").toLowerCase();
      const type = (m.type || "").toLowerCase();
      return desc.includes(s) || type.includes(s);
    });
  }, [items, search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this study material?")) return;
    setMsg("");
    try {
      await API.delete(`/study-materials/${id}`);
      setItems((prev) => prev.filter((m) => (m._id || m.id) !== id));
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
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h2 className="mb-0">Study Material – List</h2>
              <div className="small text-muted">
                Search, download and manage uploaded study materials
              </div>
            </div>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                style={{ maxWidth: 260 }}
                placeholder="Search by description / type"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={loadAll}
                disabled={loading}
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
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

          <div className="card shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="p-4 text-center text-muted">
                  Loading study materials…
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  No study materials found.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-primary">
                      <tr>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Link</th>
                        <th>File</th>
                        <th>Uploaded</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((m) => {
                        const id = m._id || m.id;
                        const fileUrl = getFileUrl(m);
                        const link = m.linkUrl || m.url;
                        return (
                          <tr key={id}>
                            <td>{m.description || m.title || "-"}</td>
                            <td>{m.type || "-"}</td>
                            <td>
                              {link ? (
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Open link
                                </a>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td>
                              {fileUrl ? (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Download
                                </a>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td>{fmtDate(m.createdAt)}</td>
                            <td className="text-center">
                              {/* For now only delete; edit can be added if needed */}
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
            Uses <code>GET /study-materials</code> and{" "}
            <code>DELETE /study-materials/:id</code>. Download just opens the
            file/link in a new tab.
          </div>
        </div>
      </div>
    </div>
  );
}
