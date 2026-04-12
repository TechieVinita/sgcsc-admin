// src/pages/TypingCertificateCreate.jsx
import { useEffect, useState } from 'react';
import API from "../api/axiosInstance";

export default function TypingCertificateCreate() {
  const [students, setStudents] = useState([]);

  // Form fields
  const [studentName, setStudentName] = useState('');
  const [fatherHusbandName, setFatherHusbandName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [computerTyping, setComputerTyping] = useState('');
  const [certificateNo, setCertificateNo] = useState('');
  const [dateOfIssue, setDateOfIssue] = useState('');
  const [sessionFrom, setSessionFrom] = useState('');
  const [sessionTo, setSessionTo] = useState('');
  const [grade, setGrade] = useState('');
  const [studyCentre, setStudyCentre] = useState('');
  const [wordsPerMinute, setWordsPerMinute] = useState('');

  // Optional links
  const [studentId, setStudentId] = useState('');

  const [loadingLists, setLoadingLists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info' | 'success' | 'danger'

  // Load students on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoadingLists(true);
      setMessage('');

      try {
        const studentsData = await API.unwrap(API.get('/students'));

        const stuArr = Array.isArray(studentsData)
          ? studentsData
          : Array.isArray(studentsData?.data)
          ? studentsData.data
          : [];

        setStudents(stuArr);
      } catch (err) {
        console.error('load students error (typing certificate):', err);
        setMessageType('danger');
        setMessage(
          err.userMessage || 'Failed to load students. Check API.'
        );
      } finally {
        setLoadingLists(false);
      }
    };

    fetchData();
  }, []);

  const validate = () => {
    if (!studentName.trim()) {
      setMessageType('danger');
      setMessage('Student Name is required.');
      return false;
    }
    if (!fatherHusbandName.trim()) {
      setMessageType('danger');
      setMessage('Father/Husband Name is required.');
      return false;
    }
    if (!motherName.trim()) {
      setMessageType('danger');
      setMessage('Mother Name is required.');
      return false;
    }
    if (!enrollmentNumber.trim()) {
      setMessageType('danger');
      setMessage('Enrollment Number is required.');
      return false;
    }
    if (!computerTyping.trim()) {
      setMessageType('danger');
      setMessage('Computer Typing is required.');
      return false;
    }
    if (!certificateNo.trim()) {
      setMessageType('danger');
      setMessage('Certificate Number is required.');
      return false;
    }
    if (!dateOfIssue) {
      setMessageType('danger');
      setMessage('Date of Issue is required.');
      return false;
    }
    if (!sessionFrom.trim()) {
      setMessageType('danger');
      setMessage('Session From is required.');
      return false;
    }
    if (!sessionTo.trim()) {
      setMessageType('danger');
      setMessage('Session To is required.');
      return false;
    }
    if (!grade.trim()) {
      setMessageType('danger');
      setMessage('Grade is required.');
      return false;
    }
    if (!studyCentre.trim()) {
      setMessageType('danger');
      setMessage('Study Centre is required.');
      return false;
    }
    if (!wordsPerMinute.trim()) {
      setMessageType('danger');
      setMessage('Words Per Minute is required.');
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
        studentName: studentName.trim(),
        fatherHusbandName: fatherHusbandName.trim(),
        motherName: motherName.trim(),
        enrollmentNumber: enrollmentNumber.trim(),
        computerTyping: computerTyping.trim(),
        certificateNo: certificateNo.trim(),
        dateOfIssue,
        sessionFrom: sessionFrom.trim(),
        sessionTo: sessionTo.trim(),
        grade: grade.trim(),
        studyCentre: studyCentre.trim(),
        wordsPerMinute: wordsPerMinute.trim(),
        studentId: studentId || undefined,
      };

      await API.unwrap(API.post('/typing-certificates', payload));

      setMessageType('success');
      setMessage('Typing Certificate created successfully.');

      // Reset form
      setStudentName('');
      setFatherHusbandName('');
      setMotherName('');
      setEnrollmentNumber('');
      setComputerTyping('');
      setCertificateNo('');
      setDateOfIssue('');
      setSessionFrom('');
      setSessionTo('');
      setGrade('');
      setStudyCentre('');
      setWordsPerMinute('');
      setStudentId('');
    } catch (err) {
      console.error('create typing certificate error:', err);
      setMessageType('danger');
      setMessage(err.userMessage || 'Failed to create typing certificate');
    } finally {
      setSaving(false);
    }
  };

  // Handle student selection to auto-fill student details
  const handleStudentChange = (e) => {
    const selectedStudentId = e.target.value;
    setStudentId(selectedStudentId);

    if (selectedStudentId) {
      const selectedStudent = students.find((s) => (s._id || s.id) === selectedStudentId);
      if (selectedStudent) {
        setStudentName(selectedStudent.name || '');
        setFatherHusbandName(selectedStudent.fatherName || '');
        setMotherName(selectedStudent.motherName || '');
        setEnrollmentNumber(selectedStudent.enrollmentNo || selectedStudent.rollNumber || '');
      }
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="flex-grow-1">
        <div className="container-fluid p-4">
          <h2 className="mb-4 fw-bold">Generate Typing Certificate</h2>

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

          <div className="card shadow-sm" style={{ maxWidth: 800 }}>
            <div className="card-body">
              {loadingLists ? (
                <div className="text-muted">Loading students…</div>
              ) : (
                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-12">
                    <h5 className="mb-3 text-primary">Student Details</h5>
                  </div>

                  {/* Student Selection (optional - for auto-fill) */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Select Student (optional - auto-fills details)
                    </label>
                    <select
                      className="form-select"
                      value={studentId}
                      onChange={handleStudentChange}
                    >
                      <option value="">Select a student</option>
                      {students.map((s) => (
                        <option key={s._id || s.id} value={s._id || s.id}>
                          {s.name || s.fullName || 'Student'}{' '}
                          {s.rollNumber ? `(${s.rollNumber})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Student Name */}
                  <div className="col-md-6">
                    <label className="form-label">Student Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter student name"
                      required
                    />
                  </div>

                  {/* Father/Husband Name */}
                  <div className="col-md-6">
                    <label className="form-label">Father/Husband Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={fatherHusbandName}
                      onChange={(e) => setFatherHusbandName(e.target.value)}
                      placeholder="Enter father/husband name"
                      required
                    />
                  </div>

                  {/* Mother Name */}
                  <div className="col-md-6">
                    <label className="form-label">Mother Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      placeholder="Enter mother name"
                      required
                    />
                  </div>

                  {/* Enrollment Number */}
                  <div className="col-md-6">
                    <label className="form-label">Enrollment Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={enrollmentNumber}
                      onChange={(e) => setEnrollmentNumber(e.target.value)}
                      placeholder="Enter enrollment number"
                      required
                    />
                  </div>

                  {/* Computer Typing */}
                  <div className="col-md-6">
                    <label className="form-label">Computer Typing *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={computerTyping}
                      onChange={(e) => setComputerTyping(e.target.value)}
                      placeholder="e.g., English/Hindi Typing"
                      required
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <h5 className="mb-3 text-primary">Certificate Details</h5>
                  </div>

                  {/* Certificate Number */}
                  <div className="col-md-6">
                    <label className="form-label">Certificate Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={certificateNo}
                      onChange={(e) => setCertificateNo(e.target.value)}
                      placeholder="Enter certificate number"
                      required
                    />
                  </div>

                  {/* Date of Issue */}
                  <div className="col-md-6">
                    <label className="form-label">Date of Issue *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dateOfIssue}
                      onChange={(e) => setDateOfIssue(e.target.value)}
                      required
                    />
                  </div>

                  {/* Session From */}
                  <div className="col-md-6">
                    <label className="form-label">Session From *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={sessionFrom}
                      onChange={(e) => setSessionFrom(e.target.value)}
                      placeholder="e.g., 2024"
                      required
                    />
                  </div>

                  {/* Session To */}
                  <div className="col-md-6">
                    <label className="form-label">Session To *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={sessionTo}
                      onChange={(e) => setSessionTo(e.target.value)}
                      placeholder="e.g., 2025"
                      required
                    />
                  </div>

                  {/* Grade */}
                  <div className="col-md-6">
                    <label className="form-label">Grade *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="e.g., A+"
                      required
                    />
                  </div>

                  {/* Study Centre */}
                  <div className="col-md-6">
                    <label className="form-label">Study Centre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studyCentre}
                      onChange={(e) => setStudyCentre(e.target.value)}
                      placeholder="Enter study centre"
                      required
                    />
                  </div>

                  {/* Words Per Minute */}
                  <div className="col-md-6">
                    <label className="form-label">Words Per Minute *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={wordsPerMinute}
                      onChange={(e) => setWordsPerMinute(e.target.value)}
                      placeholder="e.g., 50"
                      required
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={saving || loadingLists}
                    >
                      {saving ? 'Generating Typing Certificate...' : 'Generate Typing Certificate'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}