import { useState, useMemo } from "react";

export default function StudentTable({ students, onEdit, onDelete }) {
  const [sortOrder, setSortOrder] = useState("asc");

  // memoize sorted students to avoid recomputing on every render
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
  }, [students, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="table-responsive bg-white rounded shadow-sm">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-primary">
          <tr>
            <th scope="col">Roll No</th>
            <th scope="col" style={{ cursor: "pointer" }} onClick={toggleSort}>
              Name {sortOrder === "asc" ? "▲" : "▼"}
            </th>
            <th scope="col">Email</th>
            <th scope="col">Course</th>
            <th scope="col">Semester</th>
            <th scope="col">Contact</th>
            <th scope="col">DOB</th>
            <th scope="col" className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {sortedStudents.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-4 text-muted">
                No students found.
              </td>
            </tr>
          ) : (
            sortedStudents.map((s) => (
              <tr key={s._id}>
                <td>{s.rollNo || "-"}</td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.course || "-"}</td>
                <td>{s.semester || "-"}</td>
                <td>{s.contact || "-"}</td>
                <td>{s.dob ? new Date(s.dob).toLocaleDateString() : "-"}</td>
                <td className="text-center">
                  <button
                    onClick={() => onEdit(s)}
                    className="btn btn-sm btn-outline-primary me-2"
                  >
                    <i className="bi bi-pencil"></i> Edit
                  </button>
                  <button
                    onClick={() => onDelete(s._id)}
                    className="btn btn-sm btn-outline-danger"
                  >
                    <i className="bi bi-trash"></i> Delete
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
