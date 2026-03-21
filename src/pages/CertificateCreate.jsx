// src/pages/CertificateCreate.jsx
import { useState, useEffect, useRef } from 'react';
import API, { getCourses, getStudentByEnrollment } from "../api/api";

// Certificate Generator Global Reference
let certificateGenerator = null;

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
  const [renewalDate, setRenewalDate] = useState('');
  
  // State management
  const [courses, setCourses] = useState([]);
  const [filteredCourseList, setFilteredCourseList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'success' | 'danger' | 'info'
  
  // Certificate preview state
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const canvasRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  // Initialize Certificate Generator function
  const initCertificateGenerator = async () => {
    if (certificateGenerator) return certificateGenerator;
    
    // Check if already available on window
    if (window.CertificateGenerator) {
      certificateGenerator = window.CertificateGenerator;
      try {
        await certificateGenerator.loadTemplate('/template.jpeg');
        console.log('Certificate template loaded successfully');
        return certificateGenerator;
      } catch (err) {
        console.warn('Certificate template not found. Please upload a template to /public/template.jpeg');
        return certificateGenerator;
      }
    }
    
    // Script not loaded yet, dynamically load it
    return new Promise((resolve) => {
      // Load jspdf if not present
      if (!window.jspdf) {
        const jspdfScript = document.createElement('script');
        jspdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        jspdfScript.onload = () => {
          // Load certificate-generator
          const certScript = document.createElement('script');
          certScript.src = '/certificate-generator.js';
          certScript.onload = async () => {
            if (window.CertificateGenerator) {
              certificateGenerator = window.CertificateGenerator;
              try {
                await certificateGenerator.loadTemplate('/template.jpeg');
                console.log('Certificate template loaded successfully');
              } catch (err) {
                console.warn('Certificate template not found. Please upload a template to /public/template.jpeg');
              }
            }
            resolve(certificateGenerator);
          };
          document.body.appendChild(certScript);
        };
        document.body.appendChild(jspdfScript);
      } else if (!window.CertificateGenerator) {
        // jspdf loaded but certificate-generator not loaded
        const certScript = document.createElement('script');
        certScript.src = '/certificate-generator.js';
        certScript.onload = async () => {
          if (window.CertificateGenerator) {
            certificateGenerator = window.CertificateGenerator;
            try {
              await certificateGenerator.loadTemplate('/template.jpeg');
              console.log('Certificate template loaded successfully');
            } catch (err) {
              console.warn('Certificate template not found. Please upload a template to /public/template.jpeg');
            }
          }
          resolve(certificateGenerator);
        };
        document.body.appendChild(certScript);
      }
    });
  };

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
        setFilteredCourseList(data);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
    
    // Try to initialize certificate generator on mount
    initCertificateGenerator();
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
      // Fetch student using the same endpoint as FeeReceipt to get full student data with courses
      const res = await API.get('/students');
      const allStudents = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      
      // Find student by enrollment/roll number
      const student = allStudents.find(s => 
        (s.enrollmentNumber || s.rollNumber || '').toLowerCase() === enrollmentNumber.trim().toLowerCase()
      );
      
      if (student) {
        // Auto-fill student details
        setName(student.name || '');
        setFatherName(student.fatherName || '');
        
        // Use the student's courses array if available, otherwise use courseName
        if (student.courses && student.courses.length > 0) {
          // Create a filtered list from student's courses
          const studentCourses = student.courses.map(c => ({
            _id: c._id,
            name: c.courseName
          }));
          setFilteredCourseList(studentCourses);
          
          // Set the first course as default
          if (student.courses[0] && student.courses[0].courseName) {
            setCourseName(student.courses[0].courseName);
          }
          
          // Set session from first course
          if (student.courses[0] && student.courses[0].sessionStart) {
            const startYear = new Date(student.courses[0].sessionStart).getFullYear();
            setSessionFrom(startYear.toString());
          }
          if (student.courses[0] && student.courses[0].sessionEnd) {
            const endYear = new Date(student.courses[0].sessionEnd).getFullYear();
            setSessionTo(endYear.toString());
          }
        } else {
          // Fallback to old behavior
          const enrolledCourse = student.courseName || '';
          setCourseName(enrolledCourse);
          
          // Set session years if available
          if (student.sessionStart) {
            const startYear = new Date(student.sessionStart).getFullYear();
            setSessionFrom(startYear.toString());
          }
          if (student.sessionEnd) {
            const endYear = new Date(student.sessionEnd).getFullYear();
            setSessionTo(endYear.toString());
          }
          
          // Show all courses if no courses array
          const latestCourses = await getCourses();
          setCourses(latestCourses);
          setFilteredCourseList(latestCourses);
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
      setFilteredCourseList(courses);
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
    if (!renewalDate) {
      setMessageType('danger');
      setMessage('Renewal Date is required.');
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
        renewalDate,
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
      setRenewalDate('');
      setPreviewUrl(null);
    } catch (err) {
      console.error('create certificate error:', err);
      setMessageType('danger');
      setMessage(err.userMessage || 'Failed to create certificate');
    } finally {
      setSaving(false);
    }
  };

  // Handle Preview Certificate
  const handlePreview = async () => {
    if (!validate()) return;
    
    // Initialize generator if not already done
    if (!certificateGenerator) {
      setMessage('Loading certificate generator...');
      setMessageType('info');
      await initCertificateGenerator();
      
      if (!certificateGenerator) {
        setMessageType('danger');
        setMessage('Failed to load certificate generator. Please check console for details.');
        return;
      }
    }
    
    setLoadingPreview(true);
    try {
      const studentData = {
        name: name.trim(),
        atcCode: certificateNumber.trim(),
        dateOfIssue: issueDate,
        dateOfRenewal: renewalDate
      };
      
      const url = await certificateGenerator.getPreviewURL(studentData);
      setPreviewUrl(url);
      setMessageType('success');
      setMessage('Certificate preview generated!');
    } catch (err) {
      console.error('Preview error:', err);
      setMessageType('danger');
      setMessage('Failed to generate preview. Make sure template is uploaded.');
    } finally {
      setLoadingPreview(false);
    }
  };

  // Handle Download Certificate
  const handleDownload = async () => {
    if (!validate()) return;
    
    // Initialize generator if not already done
    if (!certificateGenerator) {
      setMessage('Loading certificate generator...');
      setMessageType('info');
      await initCertificateGenerator();
      
      if (!certificateGenerator) {
        setMessageType('danger');
        setMessage('Failed to load certificate generator. Please check console for details.');
        return;
      }
    }
    
    try {
      const studentData = {
        name: name.trim(),
        atcCode: certificateNumber.trim(),
        dateOfIssue: issueDate,
        dateOfRenewal: renewalDate
      };
      
      certificateGenerator.download(studentData);
      setMessageType('success');
      setMessage('Certificate download started!');
    } catch (err) {
      console.error('Download error:', err);
      setMessageType('danger');
      setMessage('Failed to download certificate. Make sure template is uploaded.');
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
                    {filteredCourseList.map((course) => (
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

                <div className="col-md-6">
                  <label className="form-label">Renewal Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
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

                {/* Certificate Preview and Download Buttons */}
                <div className="col-12 mt-4">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Certificate Preview & Download</h5>
                      <p className="text-muted small mb-3">
                        Fill all fields above, then click Preview to see or Download to save the certificate.
                        <br />
                        <span className="text-warning">Note: Upload a template.jpeg to /public folder for this feature to work.</span>
                      </p>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={handlePreview}
                          disabled={loadingPreview || !name || !certificateNumber || !issueDate}
                        >
                          {loadingPreview ? 'Generating...' : 'Preview Certificate'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={handleDownload}
                          disabled={!name || !certificateNumber || !issueDate}
                        >
                          Download Certificate (PDF)
                        </button>
                      </div>
                      
                      {/* Preview Image */}
                      {previewUrl && (
                        <div className="mt-3">
                          <h6>Preview:</h6>
                          <img 
                            src={previewUrl} 
                            alt="Certificate Preview" 
                            className="img-fluid border rounded" 
                            style={{ maxHeight: '400px' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden canvas for certificate rendering */}
      <canvas id="certCanvas" ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
}
