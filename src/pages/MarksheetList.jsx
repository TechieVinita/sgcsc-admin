// src/pages/MarksheetList.jsx
import { useEffect, useMemo, useState } from 'react';
import API from "../api/axiosInstance";

// eslint-disable-next-line no-undef
const MarksheetGenerator = window.MarksheetGenerator;

function fmtDate(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleDateString('en-IN');
}

// Function to generate PDF content as HTML and open in new window for printing
const generateMarksheetPDF = (marksheet) => {
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  
  if (!printWindow) {
    alert('Please allow popups to print the marksheet');
    return;
  }

  // Generate subjects table rows
  const subjectsRows = marksheet.subjects.map((subject, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${subject.subjectName || '-'}</td>
      <td>${subject.theoryMarks || 0}</td>
      <td>${subject.practicalMarks || 0}</td>
      <td>${subject.combinedMarks || 0}</td>
      <td>${subject.maxCombinedMarks || 0}</td>
      <td>${subject.grade || '-'}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Marksheet - ${marksheet.rollNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
        }
        .marksheet {
          max-width: 800px;
          margin: 0 auto;
          border: 2px solid #333;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #333;
        }
        .header h1 {
          font-size: 24px;
          margin-bottom: 5px;
        }
        .header h2 {
          font-size: 18px;
          color: #666;
        }
        .title {
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 20px;
          text-decoration: underline;
        }
        .details {
          display: table;
          width: 100%;
          margin-bottom: 20px;
        }
        .detail-row {
          display: table-row;
        }
        .detail-label {
          display: table-cell;
          padding: 8px 5px;
          font-weight: bold;
          width: 40%;
        }
        .detail-value {
          display: table-cell;
          padding: 8px 5px;
          border-bottom: 1px solid #ddd;
        }
        .subjects-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .subjects-table th,
        .subjects-table td {
          border: 1px solid #333;
          padding: 8px;
          text-align: center;
        }
        .subjects-table th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        .summary {
          margin-top: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          border: 1px solid #ddd;
        }
        .summary-grid {
          display: table;
          width: 100%;
        }
        .summary-row {
          display: table-row;
        }
        .summary-label {
          display: table-cell;
          padding: 5px;
          font-weight: bold;
        }
        .summary-value {
          display: table-cell;
          padding: 5px;
        }
        .footer {
          margin-top: 25px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          display: flex;
          justify-content: space-between;
        }
        .signature {
          text-align: center;
          width: 200px;
        }
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 40px;
          padding-top: 5px;
          font-size: 12px;
        }
        .print-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }
        @media print {
          .print-btn {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <button class="print-btn" onclick="window.print()">Print Marksheet</button>
      <div class="marksheet">
        <div class="header">
          <h1>${marksheet.instituteName || 'Institute Name'}</h1>
          <h2>MARKSHEET</h2>
        </div>
        
        <div class="title">Student Details</div>
        
        <div class="details">
          <div class="detail-row">
            <div class="detail-label">Enrollment Number:</div>
            <div class="detail-value">${marksheet.enrollmentNo || '-'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Roll Number:</div>
            <div class="detail-value">${marksheet.rollNumber || '-'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Student Name:</div>
            <div class="detail-value">${marksheet.studentName || '-'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Father/Husband Name:</div>
            <div class="detail-value">${marksheet.fatherName || '-'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Mother Name:</div>
            <div class="detail-value">${marksheet.motherName || '-'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Date of Birth:</div>
            <div class="detail-value">${fmtDate(marksheet.dob)}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Course Name:</div>
            <div class="detail-value">${marksheet.courseName || '-'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Course Duration:</div>
            <div class="detail-value">${marksheet.courseDuration || '-'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Course Period:</div>
            <div class="detail-value">${fmtDate(marksheet.coursePeriodFrom)} to ${fmtDate(marksheet.coursePeriodTo)}</div>
          </div>
        </div>
        
        <div class="title">Marks Details</div>
        
        <table class="subjects-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Subject Name</th>
              <th>Theory Marks</th>
              <th>Practical Marks</th>
              <th>Combined Marks</th>
              <th>Max Marks</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            ${subjectsRows}
          </tbody>
        </table>
        
        <div class="summary">
          <h3 style="text-align: center; margin-bottom: 10px;">Summary</h3>
          <div class="summary-grid">
            <div class="summary-row">
              <div class="summary-label">Total Theory Marks:</div>
              <div class="summary-value">${marksheet.totalTheoryMarks || 0}</div>
            </div>
            <div class="summary-row">
              <div class="summary-label">Total Practical Marks:</div>
              <div class="summary-value">${marksheet.totalPracticalMarks || 0}</div>
            </div>
            <div class="summary-row">
              <div class="summary-label">Total Combined Marks:</div>
              <div class="summary-value">${marksheet.totalCombinedMarks || 0} / ${marksheet.maxTotalMarks || 0}</div>
            </div>
            <div class="summary-row">
              <div class="summary-label">Percentage:</div>
              <div class="summary-value">${marksheet.percentage ? marksheet.percentage.toFixed(2) : 0}%</div>
            </div>
            <div class="summary-row">
              <div class="summary-label">Overall Grade:</div>
              <div class="summary-value">${marksheet.overallGrade || '-'}</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="signature">
            <div class="signature-line">Student Signature</div>
          </div>
          <div class="signature">
            <div class="signature-line">Authorized Signature</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export default function MarksheetList() {
  const [marksheets, setMarksheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setMsg('');
    try {
      const data = await API.unwrap(API.get('/marksheets'));

      const marksheetArr = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setMarksheets(marksheetArr);
    } catch (err) {
      console.error('fetch marksheets', err);
      setMsg(err.userMessage || 'Failed to load marksheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Initialize Marksheet Generator on mount
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [templateError, setTemplateError] = useState(null);
  
  useEffect(() => {
    const initGenerator = async () => {
      if (typeof MarksheetGenerator !== 'undefined') {
        try {
          console.log('Loading marksheet template...');
          await MarksheetGenerator.loadTemplate('/marksheet-template.jpeg');
          console.log('Marksheet template loaded successfully');
          setTemplateLoaded(true);
        } catch (err) {
          console.error('Failed to load marksheet template:', err);
          setTemplateError(err.message);
        }
      } else {
        console.warn('MarksheetGenerator not defined');
      }
    };
    initGenerator();
  }, []);

  // Function to handle download using template-based generator
  const handleTemplateDownload = (marksheet) => {
    console.log('handleTemplateDownload called:', { templateLoaded, templateError, marksheet });
    if (typeof MarksheetGenerator !== 'undefined' && templateLoaded) {
      try {
        MarksheetGenerator.download({
          enrollmentNo: marksheet.enrollmentNo,
          studentName: marksheet.studentName,
          fatherName: marksheet.fatherName,
          motherName: marksheet.motherName,
          courseName: marksheet.courseName,
          instituteName: marksheet.instituteName,
          rollNumber: marksheet.rollNumber,
          dob: marksheet.dob,
          coursePeriodFrom: marksheet.coursePeriodFrom,
          coursePeriodTo: marksheet.coursePeriodTo,
          courseDuration: marksheet.courseDuration,
          subjects: marksheet.subjects,
          totalTheoryMarks: marksheet.totalTheoryMarks,
          totalPracticalMarks: marksheet.totalPracticalMarks,
          totalCombinedMarks: marksheet.totalCombinedMarks,
          maxTotalMarks: marksheet.maxTotalMarks,
          percentage: marksheet.percentage,
          overallGrade: marksheet.overallGrade,
        });
      } catch (err) {
        console.error('Error generating PDF:', err);
        // Fallback to HTML-based generation
        generateMarksheetPDF(marksheet);
      }
    } else {
      console.warn('Template not loaded, using fallback');
      // Fallback to HTML-based generation
      generateMarksheetPDF(marksheet);
    }
  };

  const filteredMarksheets = useMemo(() => {
    if (!search.trim()) return marksheets;
    const s = search.trim().toLowerCase();
    return marksheets.filter((m) => {
      return (
        (m.enrollmentNo || '').toLowerCase().includes(s) ||
        (m.rollNumber || '').toLowerCase().includes(s) ||
        (m.studentName || '').toLowerCase().includes(s) ||
        (m.courseName || '').toLowerCase().includes(s) ||
        (m.instituteName || '').toLowerCase().includes(s)
      );
    });
  }, [marksheets, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this marksheet?')) return;
    try {
      await API.delete(`/marksheets/${id}`);
      setMarksheets((prev) => prev.filter((m) => (m._id || m.id) !== id));
      setMsg('Marksheet deleted.');
    } catch (err) {
      console.error('delete marksheet error:', err);
      setMsg(err.userMessage || 'Failed to delete marksheet');
    }
  };

  const handleDownload = (marksheet) => {
    handleTemplateDownload(marksheet);
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="flex-grow-1">
        <div className="container-fluid p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h2 className="mb-0">Marksheets</h2>
              <div className="small text-muted">
                List, search, download and delete marksheets
              </div>
            </div>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                style={{ maxWidth: 240 }}
                placeholder="Search by enrollment / roll / name / course"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={loadAll}
                disabled={loading}
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>

          {msg && <div className="alert alert-info">{msg}</div>}

          <div className="card shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="p-4 text-center text-muted">
                  Loading marksheets…
                </div>
              ) : filteredMarksheets.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  No marksheets found.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-primary">
                      <tr>
                        <th>Enrollment No.</th>
                        <th>Roll No.</th>
                        <th>Student Name</th>
                        <th>Course</th>
                        <th>Institute</th>
                        <th>Percentage</th>
                        <th>Grade</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMarksheets.map((m) => (
                        <tr key={m._id || m.id}>
                          <td>{m.enrollmentNo}</td>
                          <td>{m.rollNumber}</td>
                          <td>{m.studentName || '-'}</td>
                          <td>{m.courseName || '-'}</td>
                          <td>{m.instituteName || '-'}</td>
                          <td>{m.percentage ? `${m.percentage.toFixed(2)}%` : '-'}</td>
                          <td>{m.overallGrade || '-'}</td>
                           <td className="text-center">
                             <button
                               className="btn btn-sm btn-outline-info me-2"
                               onClick={() => generateMarksheetPDF(m)}
                               title="View Marksheet"
                             >
                               View
                             </button>
                             <button
                               className="btn btn-sm btn-outline-success me-2"
                               onClick={() => handleDownload(m)}
                               title="Download/Print Marksheet"
                             >
                               Download
                             </button>
                             <button
                               className="btn btn-sm btn-outline-danger"
                               onClick={() =>
                                 handleDelete(m._id || m.id)
                               }
                             >
                               Delete
                             </button>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden canvas for template-based marksheet generation */}
      <canvas id="marksheetCanvas" style={{ display: 'none' }}></canvas>
    </div>
  );
}
