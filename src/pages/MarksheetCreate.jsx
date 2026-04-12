// src/pages/MarksheetCreate.jsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from "../api/axiosInstance";


export default function MarksheetCreate() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  // Form fields
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [dob, setDob] = useState('');
  const [coursePeriodFrom, setCoursePeriodFrom] = useState('');
  const [coursePeriodTo, setCoursePeriodTo] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [dateOfIssue, setDateOfIssue] = useState('');
  const [overallGrade, setOverallGrade] = useState(''); // ✅ single declaration

  // Subject fields
  const [subjects, setSubjects] = useState([
    { subjectName: '', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 100, maxPracticalMarks: 0, grade: '' }
  ]);

  // Optional links
  const [courseId, setCourseId] = useState('');
  const [studentId, setStudentId] = useState('');

  const [loadingLists, setLoadingLists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const navigate = useNavigate();

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
        console.error('load students/courses error (marksheet):', err);
        setMessageType('danger');
        setMessage(err.userMessage || 'Failed to load students or courses. Check API.');
      } finally {
        setLoadingLists(false);
      }
    };

    fetchData();
  }, []);

  // Calculate totals
  const { totalTheory, totalPractical, totalCombined, maxTotal, percentage } = useMemo(() => {
    let totalTheory = 0;
    let totalPractical = 0;
    let totalCombined = 0;
    let maxTotal = 0;

    subjects.forEach(subject => {
      const theory = Number(subject.theoryMarks) || 0;
      const practical = Number(subject.practicalMarks) || 0;
      const maxTheory = Number(subject.maxTheoryMarks) || 100;
      const maxPractical = Number(subject.maxPracticalMarks) || 0;

      totalTheory += theory;
      totalPractical += practical;
      totalCombined += theory + practical;
      maxTotal += maxTheory + maxPractical;
    });

    const percentage = maxTotal > 0 ? (totalCombined / maxTotal) * 100 : 0;
    return { totalTheory, totalPractical, totalCombined, maxTotal, percentage };
  }, [subjects]);

  // ✅ Derived auto-grade — separate from the overallGrade state
  const calculateGrade = (pct) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  };

  const autoGrade = calculateGrade(percentage); // ✅ renamed to avoid shadowing

  // Auto-sync overallGrade with calculated grade whenever percentage changes
  // (only if user hasn't manually overridden it — optional UX choice)
  useEffect(() => {
    setOverallGrade(autoGrade);
  }, [autoGrade]);

  // Handle enrollment number lookup
  const handleEnrollmentLookup = async () => {
    if (!enrollmentNo.trim()) {
      setMessageType('danger');
      setMessage('Please enter an enrollment number');
      return;
    }

    try {
      setMessage('');
      const response = await API.unwrap(API.get(`/marksheets/student/${enrollmentNo.trim()}`));
      
      if (response.success && response.data) {
        const data = response.data;
        setStudentName(data.studentName || '');
        setFatherName(data.fatherName || '');
        setMotherName(data.motherName || '');
        setRollNumber(data.rollNumber || '');
        setCourseName(data.courseName || '');
        setInstituteName(data.instituteName || '');
        
        if (data.dob) {
          const dobDate = new Date(data.dob);
          setDob(dobDate.toISOString().split('T')[0]);
        }
        
        if (data.studentId) setStudentId(data.studentId);
        if (data.courseId) setCourseId(data.courseId);
        
        setMessageType('success');
        setMessage('Student details fetched successfully!');
      }
    } catch (err) {
      console.error('enrollment lookup error:', err);
      setMessageType('danger');
      setMessage(err.userMessage || 'Student not found with this enrollment number');
    }
  };

  // Handle student selection
  const handleStudentChange = (e) => {
    const selectedStudentId = e.target.value;
    setStudentId(selectedStudentId);

    if (selectedStudentId) {
      const selectedStudent = students.find((s) => (s._id || s.id) === selectedStudentId);
      if (selectedStudent) {
        if (selectedStudent.name) setStudentName(selectedStudent.name);
        if (selectedStudent.fatherName) setFatherName(selectedStudent.fatherName);
        if (selectedStudent.motherName) setMotherName(selectedStudent.motherName);
        if (selectedStudent.rollNumber) setRollNumber(selectedStudent.rollNumber);
        if (selectedStudent.enrollmentNo || selectedStudent.rollNumber) setEnrollmentNo(selectedStudent.enrollmentNo || selectedStudent.rollNumber);
        if (selectedStudent.courseName) setCourseName(selectedStudent.courseName);
        if (selectedStudent.centerName) setInstituteName(selectedStudent.centerName);

        if (selectedStudent.dob) {
          const dobDate = new Date(selectedStudent.dob);
          setDob(dobDate.toISOString().split('T')[0]);
        }
      }
    }
  };

  // Handle course selection
  const handleCourseChange = async (e) => {
    const selectedCourseId = e.target.value;
    setCourseId(selectedCourseId);

    if (selectedCourseId) {
      const selectedCourse = courses.find((c) => (c._id || c.id) === selectedCourseId);
      if (selectedCourse) {
        setCourseName(selectedCourse.name || selectedCourse.title || '');
      }
    }
  };

  // Handle subject field change
  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    if (['theoryMarks', 'practicalMarks', 'maxTheoryMarks', 'maxPracticalMarks'].includes(field)) {
      if (value === '' || value === null || value === undefined) {
        newSubjects[index] = { ...newSubjects[index], [field]: '' };
      } else {
        const numValue = Number(value);
        newSubjects[index] = { ...newSubjects[index], [field]: isNaN(numValue) ? '' : numValue };
      }
    } else {
      newSubjects[index] = { ...newSubjects[index], [field]: value };
    }
    setSubjects(newSubjects);
  };

  const validate = () => {
    const required = [
      [enrollmentNo, 'Enrollment Number'],
      [studentName, 'Student Name'],
      [fatherName, 'Father/Husband Name'],
      [motherName, 'Mother Name'],
      [courseName, 'Course Name'],
      [instituteName, 'Institute Name'],
      [rollNumber, 'Roll Number'],
    ];

    for (const [value, label] of required) {
      if (!value.trim()) {
        setMessageType('danger');
        setMessage(`${label} is required.`);
        return false;
      }
    }

    const dateFields = [
      [dob, 'Date of Birth'],
      [coursePeriodFrom, 'Course Period From'],
      [coursePeriodTo, 'Course Period To'],
      [dateOfIssue, 'Date of Issue'],
    ];

    for (const [value, label] of dateFields) {
      if (!value) {
        setMessageType('danger');
        setMessage(`${label} is required.`);
        return false;
      }
    }

    if (!courseDuration.trim()) {
      setMessageType('danger');
      setMessage('Course Duration is required.');
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
        enrollmentNo: enrollmentNo.trim(),
        studentName: studentName.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        courseName: courseName.trim(),
        instituteName: instituteName.trim(),
        rollNumber: rollNumber.trim(),
        dob,
        coursePeriodFrom,
        coursePeriodTo,
        courseDuration: courseDuration.trim(),
        dateOfIssue,
        subjects: subjects.map(s => ({
          subjectName: s.subjectName.trim(),
          theoryMarks: Number(s.theoryMarks) || 0,
          practicalMarks: Number(s.practicalMarks) || 0,
          maxTheoryMarks: Number(s.maxTheoryMarks) || 100,
          maxPracticalMarks: Number(s.maxPracticalMarks) || 0,
          grade: s.grade?.trim() || '',
        })),
        overallGrade: overallGrade.trim() || undefined, // ✅ uses state value (manual or auto-synced)
        studentId: studentId || undefined,
        courseId: courseId || undefined,
      };

      await API.unwrap(API.post('/marksheets', payload));
      
      setMessageType('success');
      setMessage('Marksheet created successfully!');
      
      setTimeout(() => navigate('/marksheets'), 500);

      // Reset form
      setEnrollmentNo('');
      setStudentName('');
      setFatherName('');
      setMotherName('');
      setCourseName('');
      setInstituteName('');
      setRollNumber('');
      setDob('');
      setCoursePeriodFrom('');
      setCoursePeriodTo('');
      setCourseDuration('');
      setDateOfIssue('');
      setOverallGrade('');
      setSubjects([{ subjectName: '', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 100, maxPracticalMarks: 0, grade: '' }]);
      setCourseId('');
      setStudentId('');
    } catch (err) {
      console.error('create marksheet error:', err);
      setMessageType('danger');
      setMessage(err.userMessage || err.response?.data?.message || 'Failed to create marksheet. Please check all fields are filled correctly.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="flex-grow-1">
        <div className="container-fluid p-4">
          <h2 className="mb-4 fw-bold">Generate Marksheet</h2>

          {message && (
            <div
              className={`alert alert-${messageType === 'danger' ? 'danger' : messageType === 'success' ? 'success' : 'info'}`}
              role="alert"
            >
              {message}
            </div>
          )}

          <div className="card shadow-sm" style={{ maxWidth: 1000 }}>
            <div className="card-body">
              {loadingLists ? (
                <div className="text-muted">Loading students and courses…</div>
              ) : (
                <form onSubmit={handleSubmit} className="row g-3">
                  {/* Student Selection */}
                  <div className="col-12">
                    <h5 className="mb-3 text-primary">Student Selection (Auto-fill)</h5>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Select Student (optional - auto-fills details)</label>
                    <select className="form-select" value={studentId} onChange={handleStudentChange}>
                      <option value="">Select a student</option>
                      {students.map((s) => (
                        <option key={s._id || s.id} value={s._id || s.id}>
                          {s.name || s.fullName || 'Student'}{s.rollNumber ? ` (${s.rollNumber})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Enrollment Number *</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={enrollmentNo}
                        onChange={(e) => setEnrollmentNo(e.target.value)}
                        placeholder="Enter enrollment number"
                        required
                      />
                      <button type="button" className="btn btn-outline-primary" onClick={handleEnrollmentLookup}>
                        Fetch Details
                      </button>
                    </div>
                    <small className="text-muted">Enter enrollment number and click "Fetch Details" to auto-fill student information</small>
                  </div>

                  {/* Student Details */}
                  <div className="col-12 mt-4">
                    <h5 className="mb-3 text-primary">Student Details</h5>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Student Name *</label>
                    <input type="text" className="form-control" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter student name" required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Father/Husband Name *</label>
                    <input type="text" className="form-control" value={fatherName} onChange={(e) => setFatherName(e.target.value)} placeholder="Enter father/husband name" required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Mother Name *</label>
                    <input type="text" className="form-control" value={motherName} onChange={(e) => setMotherName(e.target.value)} placeholder="Enter mother name" required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Roll Number *</label>
                    <input type="text" className="form-control" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="Enter roll number" required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Date of Birth *</label>
                    <input type="date" className="form-control" value={dob} onChange={(e) => setDob(e.target.value)} required />
                  </div>

                  {/* Course & Institute Details */}
                  <div className="col-12 mt-4">
                    <h5 className="mb-3 text-primary">Course & Institute Details</h5>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Select Course (optional - auto-fills course name)</label>
                    <select className="form-select" value={courseId} onChange={handleCourseChange}>
                      <option value="">Select a course</option>
                      {courses.map((c) => (
                        <option key={c._id || c.id} value={c._id || c.id}>
                          {c.name || c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Course Name *</label>
                    <input type="text" className="form-control" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Enter course name" required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Institute Name *</label>
                    <input type="text" className="form-control" value={instituteName} onChange={(e) => setInstituteName(e.target.value)} placeholder="Enter institute name" required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Course Duration *</label>
                    <input type="text" className="form-control" value={courseDuration} onChange={(e) => setCourseDuration(e.target.value)} placeholder="e.g. 1 Year, 6 Months" required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Course Period From *</label>
                    <input type="date" className="form-control" value={coursePeriodFrom} onChange={(e) => setCoursePeriodFrom(e.target.value)} required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Course Period To *</label>
                    <input type="date" className="form-control" value={coursePeriodTo} onChange={(e) => setCoursePeriodTo(e.target.value)} required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Date of Issue *</label>
                    <input type="date" className="form-control" value={dateOfIssue} onChange={(e) => setDateOfIssue(e.target.value)} required />
                    <small className="text-muted">Required for marksheet generation</small>
                  </div>

                  {/* Subjects Section */}
                  <div className="col-12 mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="mb-1 text-primary">Subjects & Marks</h5>
                        <p className="text-muted small mb-0">Enter subject names and marks manually below.</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setSubjects([...subjects, { subjectName: '', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 100, maxPracticalMarks: 0, grade: '' }])}
                      >
                        <i className="bi bi-plus-circle me-1"></i>Add Subject
                      </button>
                    </div>
                  </div>

                  {subjects.length === 0 && (
                    <div className="col-12">
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>No subjects added.</strong> Click "Add Subject" above to manually add subjects.
                      </div>
                    </div>
                  )}

                  {subjects.map((subject, index) => (
                    <div key={index} className="col-12">
                      <div className="card mb-3">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                          <strong>Subject {index + 1}: {subject.subjectName || 'Unnamed Subject'}</strong>
                          {subjects.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => setSubjects(subjects.filter((_, i) => i !== index))}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label">Subject Name</label>
                              <input type="text" className="form-control" value={subject.subjectName} onChange={(e) => handleSubjectChange(index, 'subjectName', e.target.value)} placeholder="Enter subject name" required />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Max Theory Marks</label>
                              <input type="number" className="form-control" value={subject.maxTheoryMarks} onChange={(e) => handleSubjectChange(index, 'maxTheoryMarks', e.target.value)} min="0" />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Max Practical Marks</label>
                              <input type="number" className="form-control" value={subject.maxPracticalMarks} onChange={(e) => handleSubjectChange(index, 'maxPracticalMarks', e.target.value)} min="0" />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Theory Marks Obtained</label>
                              <input type="number" className="form-control" value={subject.theoryMarks} onChange={(e) => handleSubjectChange(index, 'theoryMarks', e.target.value)} min="0" />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Practical Marks Obtained</label>
                              <input type="number" className="form-control" value={subject.practicalMarks} onChange={(e) => handleSubjectChange(index, 'practicalMarks', e.target.value)} min="0" />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Combined Marks</label>
                              <input type="text" className="form-control" value={(Number(subject.theoryMarks) || 0) + (Number(subject.practicalMarks) || 0)} readOnly disabled />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Grade (Optional)</label>
                              <input type="text" className="form-control" value={subject.grade} onChange={(e) => handleSubjectChange(index, 'grade', e.target.value)} placeholder="e.g. A, B+" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Summary Section */}
                  <div className="col-12 mt-4">
                    <div className="card bg-light">
                      <div className="card-header">
                        <h5 className="mb-0 text-primary">Marks Summary</h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-4">
                            <p className="mb-1"><strong>Total Theory Marks:</strong></p>
                            <p className="fs-5">{totalTheory}</p>
                          </div>
                          <div className="col-md-4">
                            <p className="mb-1"><strong>Total Practical Marks:</strong></p>
                            <p className="fs-5">{totalPractical}</p>
                          </div>
                          <div className="col-md-4">
                            <p className="mb-1"><strong>Total Combined Marks:</strong></p>
                            <p className="fs-5">{totalCombined} / {maxTotal}</p>
                          </div>
                          <div className="col-md-6">
                            <p className="mb-1"><strong>Percentage (Auto):</strong></p>
                            <p className="fs-5">{percentage.toFixed(2)}%</p>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label"><strong>Final Grade (Manual Entry):</strong></label>
                            <input
                              type="text"
                              className="form-control"
                              value={overallGrade}
                              onChange={(e) => setOverallGrade(e.target.value.toUpperCase())}
                              placeholder="Enter grade e.g. A, B+, Pass"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 mt-4">
                    <button type="submit" className="btn btn-primary w-100" disabled={saving || loadingLists}>
                      {saving ? 'Generating Marksheet...' : 'Generate Marksheet'}
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