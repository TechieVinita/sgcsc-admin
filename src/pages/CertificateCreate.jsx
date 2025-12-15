// src/pages/CertificateCreate.jsx
import { useState } from 'react';
import API from '../api/api';

export default function CertificateCreate() {
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'success' | 'danger' | 'info'

  const validate = () => {
    if (!enrollmentNumber.trim()) {
      setMessageType('danger');
      setMessage('Enrollment Number is required.');
      return false;
    }
    if (!issueDate) {
      setMessageType('danger');
      setMessage('Issue Date is required.');
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
      const payload = {
        enrollmentNumber: enrollmentNumber.trim(),
        issueDate,
      };

      await API.unwrap(API.post('/certificates', payload));

      setMessageType('success');
      setMessage('Certificate created successfully.');

      // reset form
      setEnrollmentNumber('');
      setIssueDate('');
    } catch (err) {
      console.error('create certificate error:', err);
      setMessageType('danger');
      setMessage(err.userMessage || 'Failed to create certificate');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="flex-grow-1">
        <div className="container-fluid p-4">
          <h2 className="mb-4 fw-bold">Create Certificate</h2>

          {message && (
            <div
              className={`alert alert-${
                messageType === 'danger'
                  ? 'danger'
                  : messageType === 'success'
                  ? 'success'
                  : 'info'
              }`}
              role="alert"
            >
              {message}
            </div>
          )}

          <div className="card shadow-sm" style={{ maxWidth: 500 }}>
            <div className="card-body">
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-12">
                  <label className="form-label">Enrollment Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Issue Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={saving}
                  >
                    {saving ? 'Saving…' : 'Create Certificate'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* <div className="mt-3 small text-muted">
            Sends <code>enrollmentNumber</code> and <code>issueDate</code> to{' '}
            <code>POST /certificates</code>.
          </div> */}
        </div>
      </div>
    </div>
  );
}
