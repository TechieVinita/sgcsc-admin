// src/pages/AddResults.jsx
import { useState } from 'react';
import API from "../api/axiosInstance";

export default function AddResults() {
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [course, setCourse] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info' | 'success' | 'danger'

  const validate = () => {
    if (!enrollmentNumber.trim()) {
      setMessageType('danger');
      setMessage('Enrollment Number is required.');
      return false;
    }
    if (!rollNo.trim()) {
      setMessageType('danger');
      setMessage('Roll No is required.');
      return false;
    }
    if (!course.trim()) {
      setMessageType('danger');
      setMessage('Course is required.');
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
        rollNo: rollNo.trim(),
        course: course.trim(),
      };

      await API.unwrap(API.post('/results', payload));

      setMessageType('success');
      setMessage('Result added successfully!');

      setEnrollmentNumber('');
      setRollNo('');
      setCourse('');
    } catch (err) {
      console.error('add result error:', err);
      setMessageType('danger');
      setMessage(err.userMessage || 'Failed to add result');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="flex-grow-1">
        <div className="container-fluid p-4">
          <h2 className="mb-4 fw-bold">Create Result</h2>

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

          <div className="card shadow-sm" style={{ maxWidth: 520 }}>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Enrollment Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Roll No.</label>
                  <input
                    type="text"
                    className="form-control"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Course</label>
                  <input
                    type="text"
                    className="form-control"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save Result'}
                </button>
              </form>
            </div>
          </div>

          {/* <div className="mt-3 small text-muted">
            This form sends <code>enrollmentNumber</code>, <code>rollNo</code>{' '}
            and <code>course</code> to <code>POST /results</code>. Listing,
            editing and deleting are handled in the <strong>Results</strong>{' '}
            page.
          </div> */}
        </div>
      </div>
    </div>
  );
}
