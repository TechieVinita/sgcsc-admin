// src/pages/MarksheetCreate.jsx
import { useEffect, useState } from 'react';
import API from "../api/axiosInstance";

// Function to get default subjects for a course
const getDefaultSubjectsForCourse = (course) => {
  const courseName = (course.name || course.title || '').toLowerCase();

  // Default subjects based on course type
  if (courseName.includes('computer') || courseName.includes('cca') || courseName.includes('application')) {
    return [
      { subjectName: 'Computer Fundamentals', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 70, maxPracticalMarks: 30, grade: '' },
      { subjectName: 'MS Office', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 70, maxPracticalMarks: 30, grade: '' },
      { subjectName: 'Internet & Email', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 70, maxPracticalMarks: 30, grade: '' },
      { subjectName: 'Typing', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 50, maxPracticalMarks: 50, grade: '' },
    ];
  } else if (courseName.includes('tally') || courseName.includes('accounting')) {
    return [
      { subjectName: 'Financial Accounting', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 80, maxPracticalMarks: 20, grade: '' },
      { subjectName: 'Tally Basics', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 60, maxPracticalMarks: 40, grade: '' },
      { subjectName: 'GST & Taxation', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 70, maxPracticalMarks: 30, grade: '' },
    ];
  } else if (courseName.includes('typing') || courseName.includes('steno')) {
    return [
      { subjectName: 'English Typing', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 40, maxPracticalMarks: 60, grade: '' },
      { subjectName: 'Hindi Typing', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 40, maxPracticalMarks: 60, grade: '' },
      { subjectName: 'Speed Building', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 50, maxPracticalMarks: 50, grade: '' },
    ];
  } else {
    // Generic default subjects
    return [
      { subjectName: 'Subject 1', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 100, maxPracticalMarks: 0, grade: '' },
      { subjectName: 'Subject 2', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 100, maxPracticalMarks: 0, grade: '' },
      { subjectName: 'Subject 3', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 100, maxPracticalMarks: 0, grade: '' },
    ];
  }
};

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

  // Subject fields
  const [numberOfSubjects, setNumberOfSubjects] = useState(1);
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
        setMessage(
          err.userMessage || 'Failed to load students or courses. Check API.'
        );
      } finally {
        setLoadingLists(false);
      }
    };

    fetchData();
  }, []);

  // Handle number of subjects change (only when manually changed, not when course is selected)
  useEffect(() => {
    // Skip if subjects were just set by course selection
    if (subjects.length > 0 && subjects[0].subjectName) return;

    const num = parseInt(numberOfSubjects) || 1;
    const newSubjects = [];
    for (let i = 0; i < num; i++) {
      if (subjects[i]) {
        newSubjects.push(subjects[i]);
      } else {
        newSubjects.push({ subjectName: '', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 100, maxPracticalMarks: 0, grade: '' });
      }
    }
    setSubjects(newSubjects);
  }, [numberOfSubjects, subjects]);

  // Calculate totals
  const calculateTotals = () => {
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
  };

  const { totalTheory, totalPractical, totalCombined, maxTotal, percentage } = calculateTotals();

  // Calculate grade based on percentage
  const calculateGrade = (pct) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  };

  const overallGrade = calculateGrade(percentage);

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
    console.log('Course selected:', selectedCourseId);
    setCourseId(selectedCourseId);

    if (selectedCourseId) {
      const selectedCourse = courses.find((c) => (c._id || c.id) === selectedCourseId);
      if (selectedCourse) {
        setCourseName(selectedCourse.name || selectedCourse.title || '');

        // First try to fetch subjects from the separate subjects collection
        try {
          console.log('Fetching subjects for course:', selectedCourseId);
          const subjectsResponse = await API.unwrap(API.get(`/subjects?course=${selectedCourseId}`));
          const subjectsData = Array.isArray(subjectsResponse) ? subjectsResponse : Array.isArray(subjectsResponse?.data) ? subjectsResponse.data : [];
          console.log('Subjects response:', subjectsResponse, 'Subjects data:', subjectsData);

          if (subjectsData.length > 0) {
            const courseSubjects = subjectsData.map((subject) => ({
              subjectName: subject.name || subject.subjectName || '',
              theoryMarks: '',
              practicalMarks: '',
              maxTheoryMarks: subject.maxMarks || 100,
              maxPracticalMarks: 0,
              grade: ''
            }));
            setSubjects(courseSubjects);
            setNumberOfSubjects(courseSubjects.length);
            setMessageType('success');
            setMessage(`Successfully imported ${courseSubjects.length} subject(s) from the course. You can now enter marks for each subject.`);
            return; // Successfully loaded subjects, exit
          }
        } catch (err) {
          console.error('Error fetching subjects from subjects collection:', err);
          // Continue to check embedded subjects
        }

        // Fallback: Check for embedded subjects in the course
        console.log('Checking embedded subjects in course:', selectedCourse.subjects);
        if (selectedCourse.subjects && Array.isArray(selectedCourse.subjects) && selectedCourse.subjects.length > 0) {
          const courseSubjects = selectedCourse.subjects.map((subject) => ({
            subjectName: subject.name || '',
            theoryMarks: '',
            practicalMarks: '',
            maxTheoryMarks: subject.hasPractical ? 70 : 100, // Assume 70 theory + 30 practical if hasPractical
            maxPracticalMarks: subject.hasPractical ? 30 : 0,
            grade: ''
          }));
          setSubjects(courseSubjects);
          setNumberOfSubjects(courseSubjects.length);
          setMessageType('success');
          setMessage(`Successfully imported ${courseSubjects.length} subject(s) from course data. You can now enter marks for each subject.`);
        } else {
          // If no subjects found anywhere, provide default subjects for common courses
          console.log('No subjects found, providing defaults for course:', selectedCourse.name || selectedCourse.title);
          const defaultSubjects = getDefaultSubjectsForCourse(selectedCourse);
          if (defaultSubjects.length > 0) {
            setSubjects(defaultSubjects);
            setNumberOfSubjects(defaultSubjects.length);
            setMessageType('info');
            setMessage(`No subjects found for this course. Using default subjects. You can modify them as needed.`);
          } else {
            setSubjects([]);
            setNumberOfSubjects(0);
            setMessageType('info');
            setMessage('No subjects found for this course. You can add subjects manually using the "Add Subject" button below.');
          }
        }
      }
    } else {
      // If no course selected, reset subjects
      setSubjects([]);
      setNumberOfSubjects(0);
    }
  };

  // Handle subject field change
  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    // For number fields, allow empty strings for better UX, convert to number only when not empty
    if (field === 'theoryMarks' || field === 'practicalMarks' || field === 'maxTheoryMarks' || field === 'maxPracticalMarks') {
      // Allow empty string, or convert to number if it's a valid number
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
    if (!enrollmentNo.trim()) {
      setMessageType('danger');
      setMessage('Enrollment Number is required.');
      return false;
    }
    if (!studentName.trim()) {
      setMessageType('danger');
      setMessage('Student Name is required.');
      return false;
    }
    if (!fatherName.trim()) {
      setMessageType('danger');
      setMessage('Father/Husband Name is required.');
      return false;
    }
    if (!motherName.trim()) {
      setMessageType('danger');
      setMessage('Mother Name is required.');
      return false;
    }
    if (!courseName.trim()) {
      setMessageType('danger');
      setMessage('Course Name is required.');
      return false;
    }
    if (!instituteName.trim()) {
      setMessageType('danger');
      setMessage('Institute Name is required.');
      return false;
    }
    if (!rollNumber.trim()) {
      setMessageType('danger');
      setMessage('Roll Number is required.');
      return false;
    }
    if (!dob) {
      setMessageType('danger');
      setMessage('Date of Birth is required.');
      return false;
    }
    if (!coursePeriodFrom) {
      setMessageType('danger');
      setMessage('Course Period From is required.');
      return false;
    }
    if (!coursePeriodTo) {
      setMessageType('danger');
      setMessage('Course Period To is required.');
      return false;
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
        subjects: subjects.map(s => ({
          subjectName: s.subjectName.trim(),
          theoryMarks: Number(s.theoryMarks) || 0,
          practicalMarks: Number(s.practicalMarks) || 0,
          maxTheoryMarks: Number(s.maxTheoryMarks) || 100,
          maxPracticalMarks: Number(s.maxPracticalMarks) || 0,
          grade: s.grade?.trim() || '',
        })),
        studentId: studentId || undefined,
        courseId: courseId || undefined,
      };

      await API.unwrap(API.post('/marksheets', payload));

      setMessageType('success');
      setMessage('Marksheet created successfully.');

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
      setNumberOfSubjects(1);
       setSubjects([{ subjectName: '', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 100, maxPracticalMarks: 0, grade: '' }]);
      setCourseId('');
      setStudentId('');
    } catch (err) {
      console.error('create marksheet error:', err);
      setMessageType('danger');
      setMessage(err.userMessage || 'Failed to create marksheet');
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
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleEnrollmentLookup}
                      >
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
                    <input
                      type="text"
                      className="form-control"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter student name"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Father/Husband Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="Enter father/husband name"
                      required
                    />
                  </div>

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

                  <div className="col-md-6">
                    <label className="form-label">Roll Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="Enter roll number"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Date of Birth *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                    />
                  </div>

                  {/* Course & Institute Details */}
                  <div className="col-12 mt-4">
                    <h5 className="mb-3 text-primary">Course & Institute Details</h5>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Select Course (optional - auto-fills course name)
                    </label>
                    <select
                      className="form-select"
                      value={courseId}
                      onChange={handleCourseChange}
                    >
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
                    <input
                      type="text"
                      className="form-control"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="Enter course name"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Institute Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={instituteName}
                      onChange={(e) => setInstituteName(e.target.value)}
                      placeholder="Enter institute name"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Course Duration *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={courseDuration}
                      onChange={(e) => setCourseDuration(e.target.value)}
                      placeholder="e.g. 1 Year, 6 Months"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Course Period From *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={coursePeriodFrom}
                      onChange={(e) => setCoursePeriodFrom(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Course Period To *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={coursePeriodTo}
                      onChange={(e) => setCoursePeriodTo(e.target.value)}
                      required
                    />
                  </div>

                  {/* Subjects Section */}
                  <div className="col-12 mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="mb-1 text-primary">Subjects & Marks</h5>
                        <p className="text-muted small mb-0">Subject names are automatically imported from the selected course. Enter the marks for each subject below.</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => {
                          setSubjects([...subjects, { subjectName: '', theoryMarks: '', practicalMarks: '', maxTheoryMarks: 100, maxPracticalMarks: 0, grade: '' }]);
                          setNumberOfSubjects(subjects.length + 1);
                        }}
                      >
                        <i className="bi bi-plus-circle me-1"></i>
                        Add Subject
                      </button>
                    </div>
                  </div>

                  {subjects.length === 0 && (
                    <div className="col-12">
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>No subjects loaded.</strong> To get started:
                        <ol className="mb-0 mt-2">
                          <li>Select a course above to auto-import subjects (if subjects have been created for that course)</li>
                          <li>Or click "Add Subject" above to manually add subjects</li>
                        </ol>
                      </div>
                    </div>
                  )}

                  {/* Subject Input Fields */}
                  {subjects.map((subject, index) => (
                    <div key={index} className="col-12">
                      <div className="card mb-3">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                          <strong>Subject {index + 1}: {subject.subjectName || 'Unnamed Subject'}</strong>
                          {subjects.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => {
                                const newSubjects = subjects.filter((_, i) => i !== index);
                                setSubjects(newSubjects);
                                setNumberOfSubjects(newSubjects.length);
                              }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label">Subject Name {subject.subjectName ? '(from course)' : '(manual entry)'}</label>
                              <input
                                type="text"
                                className="form-control"
                                value={subject.subjectName}
                                onChange={(e) => handleSubjectChange(index, 'subjectName', e.target.value)}
                                placeholder="Enter subject name"
                              />
                            </div>

                            <div className="col-md-3">
                              <label className="form-label">Max Theory Marks</label>
                              <input
                                type="number"
                                className="form-control"
                                value={subject.maxTheoryMarks}
                                onChange={(e) => handleSubjectChange(index, 'maxTheoryMarks', e.target.value)}
                                min="0"
                              />
                            </div>

                            <div className="col-md-3">
                              <label className="form-label">Max Practical Marks</label>
                              <input
                                type="number"
                                className="form-control"
                                value={subject.maxPracticalMarks}
                                onChange={(e) => handleSubjectChange(index, 'maxPracticalMarks', e.target.value)}
                                min="0"
                              />
                            </div>

                            <div className="col-md-3">
                              <label className="form-label">Theory Marks Obtained</label>
                              <input
                                type="number"
                                className="form-control"
                                value={subject.theoryMarks}
                                onChange={(e) => handleSubjectChange(index, 'theoryMarks', e.target.value)}
                                min="0"
                              />
                            </div>

                            <div className="col-md-3">
                              <label className="form-label">Practical Marks Obtained</label>
                              <input
                                type="number"
                                className="form-control"
                                value={subject.practicalMarks}
                                onChange={(e) => handleSubjectChange(index, 'practicalMarks', e.target.value)}
                                min="0"
                              />
                            </div>

                            <div className="col-md-3">
                              <label className="form-label">Combined Marks</label>
                              <input
                                type="text"
                                className="form-control"
                                value={(Number(subject.theoryMarks) || 0) + (Number(subject.practicalMarks) || 0)}
                                readOnly
                                disabled
                              />
                            </div>

                            <div className="col-md-3">
                              <label className="form-label">Grade (Optional)</label>
                              <input
                                type="text"
                                className="form-control"
                                value={subject.grade}
                                onChange={(e) => handleSubjectChange(index, 'grade', e.target.value)}
                                placeholder="e.g. A, B+"
                              />
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
                            <p className="mb-1"><strong>Percentage:</strong></p>
                            <p className="fs-5">{percentage.toFixed(2)}%</p>
                          </div>
                          <div className="col-md-6">
                            <p className="mb-1"><strong>Overall Grade:</strong></p>
                            <p className="fs-5">{overallGrade}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={saving || loadingLists}
                    >
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
