// src/pages/AssignmentUpload.jsx
import { useState } from 'react';
import API from '../api/api';

export default function AssignmentUpload() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info' | 'success' | 'danger'

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const validate = () => {
    if (!file) {
      setMessageType('danger');
      setMessage('Please select a file to upload.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validate()) return;

    setSaving(true);

    try {
      const form = new FormData();
      form.append('file', file); // MUST match multer field name in backend
      form.append('description', description || '');

      await API.post('/assignments', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessageType('success');
      setMessage('Assignment uploaded successfully.');
      setFile(null);
      setDescription('');
      e.target.reset();
    } catch (err) {
      console.error('upload assignment error:', err);
      setMessageType('danger');
      setMessage(err.userMessage || 'Failed to upload assignment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="flex-grow-1">
        <div className="container-fluid p-4">
          <h2 className="mb-3 fw-bold">Upload Assignment</h2>
          <div className="small text-muted mb-3">
            Upload Word, PDF, or PowerPoint files with an optional
            description.
          </div>

          {message && (
            <div
              className={`alert alert-${
                messageType === 'danger'
                  ? 'danger'
                  : messageType === 'success'
                  ? 'success'
                  : 'info'
              }`}
            >
              {message}
            </div>
          )}

          <div className="card shadow-sm" style={{ maxWidth: 600 }}>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">File *</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFileChange}
                    required
                  />
                  <div className="small text-muted mt-1">
                    Allowed: .doc, .docx, .pdf, .ppt, .pptx (max ~20MB)
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Description (optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description about this assignment"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={saving}
                >
                  {saving ? 'Uploading…' : 'Upload Assignment'}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-3 small text-muted">
            This sends a multipart request to <code>POST /assignments</code>{' '}
            with fields <code>file</code> and <code>description</code>.
          </div>
        </div>
      </div>
    </div>
  );
}
