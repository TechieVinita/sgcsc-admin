import { useEffect, useState } from "react";
import API from "../api/api";

// Derive API origin for file downloads
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

  const fname = item.fileName || "";
  if (!fname) return "";

  if (fname.startsWith("http")) return fname;
  return `${API_ORIGIN}/uploads/${fname.replace(/^uploads[\\/]/, "")}`;
}

const TYPE_OPTIONS = ["pdf", "word", "ppt", "link", "other"];

export default function StudyUpload() {
  // 🔥 REQUIRED FIELD
  const [name, setName] = useState("");

  const [description, setDescription] = useState("");
  const [type, setType] = useState("pdf");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState(null);

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");

  const loadAll = async () => {
    setLoading(true);
    setMsg("");
    try {
      const data = await API.unwrap(API.get("/study-materials"));
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      setMsgType("danger");
      setMsg(err.userMessage || "Failed to load study materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const validate = () => {
    if (!name.trim()) {
      setMsgType("danger");
      setMsg("Name is required.");
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

      // ✅ MUST MATCH BACKEND
      form.append("name", name.trim());
      form.append("description", description.trim());
      form.append("type", type);
      if (linkUrl.trim()) form.append("linkUrl", linkUrl.trim());
      if (file) form.append("file", file);

      await API.post("/study-materials", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsgType("success");
      setMsg("Study material uploaded successfully.");

      setName("");
      setDescription("");
      setType("pdf");
      setLinkUrl("");
      setFile(null);

      await loadAll();
    } catch (err) {
      setMsgType("danger");
      setMsg(err.userMessage || "Failed to upload study material");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this study material?")) return;
    try {
      await API.delete(`/study-materials/${id}`);
      setMaterials((prev) => prev.filter((m) => (m._id || m.id) !== id));
      setMsgType("success");
      setMsg("Deleted.");
    } catch (err) {
      setMsgType("danger");
      setMsg(err.userMessage || "Delete failed");
    }
  };

  return (
    <div className="container-fluid p-4">
      <h2>Study Material – Upload</h2>

      {msg && <div className={`alert alert-${msgType}`}>{msg}</div>}

      <form className="row g-3 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-6">
          <label className="form-label">Name *</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. HTML Basics"
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Description</label>
          <input
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
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
                {t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-5">
          <label className="form-label">Link URL (optional)</label>
          <input
            className="form-control"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com/file.pdf"
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Upload file</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="col-md-3">
          <button className="btn btn-primary w-100" disabled={saving}>
            {saving ? "Uploading…" : "Upload"}
          </button>
        </div>
      </form>

      <hr />

      {/* {loading ? (
        <p>Loading…</p>
      ) : materials.length === 0 ? (
        <p>No study materials uploaded.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>File / Link</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => {
              const id = m._id || m.id;
              const fileUrl = getFileUrl(m);
              return (
                <tr key={id}>
                  <td>{m.name}</td>
                  <td>{m.type}</td>
                  <td>
                    {m.linkUrl && (
                      <a href={m.linkUrl} target="_blank" rel="noreferrer">
                        Open link
                      </a>
                    )}
                    {fileUrl && (
                      <>
                        {m.linkUrl && " | "}
                        <a href={fileUrl} target="_blank" rel="noreferrer">
                          Download file
                        </a>
                      </>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
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
      )}
       */}
    </div>
  );
}
