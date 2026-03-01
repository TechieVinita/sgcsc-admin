// src/pages/CertificateCreate.jsx
import { useState, useEffect } from 'react';
import API, { getCourses, getStudentByEnrollment } from "../api/api";

export default function CertificateCreate() {
  // Form fields
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [sessionFrom, setSessionFrom] = useState('');
  const [sessionTo, setSessionTo] = useState('');
  const [grade, setGrade] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  
  // State management
  const [courses, setCourses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'success' | 'danger' | 'info'

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  // Lookup student by enrollment number
  const handleLookupStudent = async () => {
    if (!enrollmentNumber.trim()) {
      setMessageType('danger');
      setMessage('Please enter an enrollment number first.');
      return;
    }

    setLoadingStudent(true);
    setMessage('');

    try {
      const student = await getStudentByEnrollment(enrollmentNumber.trim());
      
      if (student) {
        // Auto-fill student details
        setName(student.name || '');
        setFatherName(student.fatherName || '');
        setCourseName(student.courseName || '');
        
        // Set session years if available
        if (student.sessionStart) {
          const startYear = new Date(student.sessionStart).getFullYear();
          setSessionFrom(startYear.toString());
        }
        if (student.sessionEnd) {
          const endYear = new Date(student.sessionEnd).getFullYear();
          setSessionTo(endYear.toString());
        }

        setMessageType('success');
        setMessage('Student details loaded successfully!');
      }
    } catch (err) {
      console.error('Student lookup error:', err);
      setMessageType('danger');
      setMessage(err.userMessage || 'Student not found with this enrollment number.');
      // Clear auto-filled fields on error
      setName('');
      setFatherName('');
      setCourseName('');
      setSessionFrom('');
      setSessionTo('');
    } finally {
      setLoadingStudent(false);
    }
  };

  const validate = () => {
    if (!enrollmentNumber.trim()) {
      setMessageType('danger');
      setMessage('Enrollment Number is required.');
      return false;
    }
    if (!name.trim()) {
      setMessageType('danger');
      setMessage('Name is required.');
      return false;
    }
    if (!fatherName.trim()) {
      setMessageType('danger');
      setMessage("Father's Name is required.");
      return false;
    }
    if (!courseName.trim()) {
      setMessageType('danger');
      setMessage('Course Name is required.');
      return false;
    }
    if (!sessionFrom) {
      setMessageType('danger');
      setMessage('Session From is required.');
      return false;
    }
    if (!sessionTo) {
      setMessageType('danger');
      setMessage('Session To is required.');
      return false;
    }
    if (!grade.trim()) {
      setMessageType('danger');
      setMessage('Grade is required.');
      return false;
    }
    if (!certificateNumber.trim()) {
      setMessageType('danger');
      setMessage('Certificate Number is required.');
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
        name: name.trim(),
        fatherName: fatherName.trim(),
        courseName: courseName.trim(),
        sessionFrom: parseInt(sessionFrom),
        sessionTo: parseInt(sessionTo),
        grade: grade.trim(),
        enrollmentNumber: enrollmentNumber.trim(),
        certificateNumber: certificateNumber.trim(),
        issueDate,
      };

      await API.post('/certificates', payload);

      setMessageType('success');
      setMessage('Certificate created successfully.');

      // reset form
      setEnrollmentNumber('');
      setName('');
      setFatherName('');
      setCourseName('');
      setSessionFrom('');
      setSessionTo('');
      setGrade('');
      setCertificateNumber('');
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

          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSubmit} className="row g-3">
                {/* Enrollment Number - First field with Lookup button */}
                <div className="col-md-6">
                  <label className="form-label">Enrollment Number *</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={enrollmentNumber}
                      onChange={(e) => setEnrollmentNumber(e.target.value)}
                      placeholder="Enter enrollment number"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleLookupStudent}
                      disabled={loadingStudent}
                    >
                      {loadingStudent ? 'Looking up...' : 'Lookup'}
                    </button>
                  </div>
                  <small className="text-muted">
                    Enter enrollment number and click Lookup to auto-fill student details
                  </small>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Father's Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    required
                  />
                </div>

                {/* Course Name - Dropdown */}
                <div className="col-md-6">
                  <label className="form-label">Course Name *</label>
                  <select
                    className="form-select"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course.name}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Session From *</label>
                  <select
                    className="form-select"
                    value={sessionFrom}
                    onChange={(e) => setSessionFrom(e.target.value)}
                    required
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Session To *</label>
                  <select
                    className="form-select"
                    value={sessionTo}
                    onChange={(e) => setSessionTo(e.target.value)}
                    required
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Grade *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g., A, A+, First Division"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Certificate Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
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
        </div>
      </div>
    </div>
  );
}
