// src/pages/AdmitCardCreate.jsx
import { useEffect, useState } from 'react';
import API from '../api/api';

export default function AdmitCardCreate() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [courseId, setCourseId] = useState('');
  const [examCenter, setExamCenter] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [studentId, setStudentId] = useState('');

  const [loadingLists, setLoadingLists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info' | 'success' | 'danger'

  // Load students + courses on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoadingLists(true);
      setMessage('');

      try {
        const [studentsData, coursesData] = await Promise.all([
          API.unwrap(API.get('/students')),
          API.unwrap(API.get('/courses')),
        ]);

        const stuArr = Array.isArray(studentsData)
          ? studentsData
          : Array.isArray(studentsData?.data)
          ? studentsData.data
          : [];

        const courseArr = Array.isArray(coursesData)
          ? coursesData
          : Array.isArray(coursesData?.data)
          ? coursesData.data
          : [];

        setStudents(stuArr);
        setCourses(courseArr);
      } catch (err) {
        console.error('load students/courses error (admit card):', err);
        setMessageType('danger');
        setMessage(
          err.userMessage || 'Failed to load students or courses. Check API.'
        );
      } finally {
        setLoadingLists(false);
      }
    };

    fetchData();
  }, []);

  const validate = () => {
    if (!enrollmentNumber.trim()) {
      setMessageType('danger');
      setMessage('Enrollment Number is required.');
      return false;
    }
    if (!rollNumber.trim()) {
      setMessageType('danger');
      setMessage('Roll Number is required.');
      return false;
    }
    if (!examDate) {
      setMessageType('danger');
      setMessage('Exam Date is required.');
      return false;
    }
    if (!examTime.trim()) {
      setMessageType('danger');
      setMessage('Exam Time is required.');
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
      const selectedCourse = courses.find((c) => (c._id || c.id) === courseId);

      const payload = {
        enrollmentNumber: enrollmentNumber.trim(),
        rollNumber: rollNumber.trim(),
        examCenter: examCenter.trim(),
        examDate,
        examTime: examTime.trim(),
        studentId: studentId || undefined,
        courseId: courseId || undefined,
        courseName:
          selectedCourse?.name || selectedCourse?.title || undefined,
      };

      await API.unwrap(API.post('/admit-cards', payload));

      setMessageType('success');
      setMessage('Admit Card created successfully.');

      // reset
      setEnrollmentNumber('');
      setRollNumber('');
      setCourseId('');
      setExamCenter('');
      setExamDate('');
      setExamTime('');
      setStudentId('');
    } catch (err) {
      console.error('create admit card error:', err);
      setMessageType('danger');
      setMessage(err.userMessage || 'Failed to create admit card');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="flex-grow-1">
        <div className="container-fluid p-4">
          <h2 className="mb-4 fw-bold">Generate Admit Card</h2>

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

          <div className="card shadow-sm" style={{ maxWidth: 700 }}>
            <div className="card-body">
              {loadingLists ? (
                <div className="text-muted">Loading students and courses…</div>
              ) : (
                <form onSubmit={handleSubmit} className="row g-3">
                  {/* Enrollment Number */}
                  <div className="col-md-6">
                    <label className="form-label">Enrollment Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={enrollmentNumber}
                      onChange={(e) => setEnrollmentNumber(e.target.value)}
                      required
                    />
                  </div>

                  {/* Roll Number */}
                  <div className="col-md-6">
                    <label className="form-label">Roll Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      required
                    />
                  </div>

                  {/* Student (optional link) */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Student (optional – for linking)
                    </label>
                    <select
                      className="form-select"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    >
                      <option value="">Not linked to a student</option>
                      {students.map((s) => (
                        <option key={s._id || s.id} value={s._id || s.id}>
                          {s.name || s.fullName || 'Student'}{' '}
                          {s.rollNo ? `(${s.rollNo})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course */}
                  <div className="col-md-6">
                    <label className="form-label">Course (optional)</label>
                    <select
                      className="form-select"
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                    >
                      <option value="">No specific course</option>
                      {courses.map((c) => (
                        <option key={c._id || c.id} value={c._id || c.id}>
                          {c.name || c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Exam Center */}
                  <div className="col-md-12">
                    <label className="form-label">Exam Center</label>
                    <input
                      type="text"
                      className="form-control"
                      value={examCenter}
                      onChange={(e) => setExamCenter(e.target.value)}
                      placeholder="Center name and address"
                    />
                  </div>

                  {/* Exam Date */}
                  <div className="col-md-6">
                    <label className="form-label">Exam Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* Exam Time */}
                  <div className="col-md-6">
                    <label className="form-label">Exam Time *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={examTime}
                      onChange={(e) => setExamTime(e.target.value)}
                      placeholder="e.g. 10:00 AM – 12:00 PM"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={saving || loadingLists}
                    >
                      {saving ? 'Saving…' : 'Create Admit Card'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* <div className="mt-3 small text-muted">
            This form sends <code>enrollmentNumber</code>,{' '}
            <code>rollNumber</code>, <code>examCenter</code>,{' '}
            <code>examDate</code>, <code>examTime</code>, and optional{' '}
            <code>studentId</code>/<code>courseId</code> to{' '}
            <code>POST /admit-cards</code>.
          </div> */}
        </div>
      </div>
    </div>
  );
}
