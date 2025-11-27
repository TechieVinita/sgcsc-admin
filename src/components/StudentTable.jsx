// src/components/StudentTable.jsx
import { useState, useMemo } from 'react';

export default function StudentTable({ students, onEdit, onDelete }) {
  const [sortOrder, setSortOrder] = useState('asc');

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) =>
      sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
  }, [students, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const formatDate = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '-';
    return dt.toLocaleDateString();
  };

  return (
    <div className="table-responsive bg-white rounded shadow-sm">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-primary">
          <tr>
            <th scope="col">Roll No</th>
            <th
              scope="col"
              style={{ cursor: 'pointer' }}
              onClick={toggleSort}
            >
              Name {sortOrder === 'asc' ? '▲' : '▼'}
            </th>
            <th scope="col">Email</th>
            <th scope="col">Course</th>
            <th scope="col">Semester</th>
            <th scope="col">Join Date</th>
            <th scope="col">Contact</th>
            <th scope="col">DOB</th>
            <th scope="col" className="text-center">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedStudents.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center py-4 text-muted">
                No students found.
              </td>
            </tr>
          ) : (
            sortedStudents.map((s) => (
              <tr key={s._id || s.id}>
                <td>{s.rollNo || '-'}</td>
                <td>{s.name}</td>
                <td>{s.email || '-'}</td>
                <td>{s.courseName || s.course?.name || '-'}</td>
                <td>{s.semester || '-'}</td>
                <td>{formatDate(s.joinDate)}</td>
                <td>{s.contact || '-'}</td>
                <td>{formatDate(s.dob)}</td>
                <td className="text-center">
                  <button
                    onClick={() => onEdit(s)}
                    className="btn btn-sm btn-outline-primary me-2"
                  >
                    <i className="bi bi-pencil" /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(s._id || s.id)}
                    className="btn btn-sm btn-outline-danger"
                  >
                    <i className="bi bi-trash" /> Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
