// src/pages/AddResults.jsx
import { useEffect, useState } from 'react';
import API from '../api/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function AddResults() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [semester, setSemester] = useState('');
  const [marks, setMarks] = useState('');

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
        console.error('load students/courses error:', err);
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
    if (!studentId) {
      setMessageType('danger');
      setMessage('Please select a student.');
      return false;
    }
    if (!courseId) {
      setMessageType('danger');
      setMessage('Please select a course.');
      return false;
    }
    if (!semester) {
      setMessageType('danger');
      setMessage('Please enter semester.');
      return false;
    }
    if (marks === '') {
      setMessageType('danger');
      setMessage('Please enter marks.');
      return false;
    }

    const semNum = Number(semester);
    if (!Number.isFinite(semNum) || semNum < 1) {
      setMessageType('danger');
      setMessage('Semester must be a positive number.');
      return false;
    }

    const marksNum = Number(marks);
    if (!Number.isFinite(marksNum) || marksNum < 0 || marksNum > 100) {
      setMessageType('danger');
      setMessage('Marks must be between 0 and 100.');
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
      // Find selected course for its name/title
      const selectedCourse = courses.find(
        (c) => (c._id || c.id) === courseId
      );

      const payload = {
        studentId,
        courseId,
        // send a human-readable course name too (backend can store it or ignore it)
        course:
          selectedCourse?.name ||
          selectedCourse?.title ||
          '',
        semester: Number(semester),
        marks: Number(marks),
      };

      await API.unwrap(API.post('/results', payload));

      setMessageType('success');
      setMessage('Result added successfully!');

      // Reset form
      setStudentId('');
      setCourseId('');
      setSemester('');
      setMarks('');
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
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />

        <div className="container-fluid p-4">
          <h2 className="mb-4 fw-bold">Add Result</h2>

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
              {loadingLists ? (
                <div className="text-muted">Loading students and courses…</div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Student */}
                  <div className="mb-3">
                    <label className="form-label">Student</label>
                    <select
                      className="form-select"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                    >
                      <option value="">Select Student</option>
                      {students.map((s) => (
                        <option key={s._id || s.id} value={s._id || s.id}>
                          {s.name} {s.rollNo ? `(${s.rollNo})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course (from /courses) */}
                  <div className="mb-3">
                    <label className="form-label">Course</label>
                    <select
                      className="form-select"
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      required
                    >
                      <option value="">Select Course</option>
                      {courses.map((c) => (
                        <option key={c._id || c.id} value={c._id || c.id}>
                          {c.name || c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Semester */}
                  <div className="mb-3">
                    <label className="form-label">Semester</label>
                    <input
                      type="number"
                      className="form-control"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      min="1"
                      required
                    />
                  </div>

                  {/* Marks */}
                  <div className="mb-3">
                    <label className="form-label">Marks</label>
                    <input
                      type="number"
                      className="form-control"
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                      min="0"
                      max="100"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={saving || loadingLists}
                  >
                    {saving ? 'Saving…' : 'Add Result'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-3 small text-muted">
            This form sends <code>studentId</code>, <code>courseId</code>,{' '}
            <code>course</code> (name), <code>semester</code> and{' '}
            <code>marks</code> to <code>POST /results</code>. To make results
            appear on the Students page, your backend needs to:
            <ul className="mt-2 mb-0">
              <li>store results linked to the student and course, and</li>
              <li>expose them via <code>/students</code> or a dedicated endpoint.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
