import { useState, useMemo } from "react";
import API from "../api/axiosInstance";

// Inline placeholder — no external HTTP request
const DEV_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-size="10" fill="#999">Photo</text>
    </svg>`
  );

let API_ORIGIN = "";
try {
  const base = API?.defaults?.baseURL || "";
  if (base) API_ORIGIN = new URL(base).origin;
} catch {
  API_ORIGIN = window.location.origin;
}

function imgUrl(filenameOrUrl) {
  if (!filenameOrUrl) return DEV_PLACEHOLDER;

  if (filenameOrUrl.startsWith("http://") || filenameOrUrl.startsWith("https://")) {
    return filenameOrUrl;
  }

  // If DB ever stores "uploads/..." or "assignments/..." include as-is
  if (filenameOrUrl.includes("/")) {
    const rel = filenameOrUrl.startsWith("/")
      ? filenameOrUrl.slice(1)
      : filenameOrUrl;
    return `${API_ORIGIN}/${rel}`;
  }

  // Normal case: DB has just "17644....png"
  const path = `/uploads/${filenameOrUrl}`;
  return `${API_ORIGIN}${path}`;
}

export default function StudentTable({ students, onEdit, onDelete }) {
  const [sortOrder, setSortOrder] = useState("asc");

  const sortedStudents = useMemo(
    () =>
      [...(students || [])].sort((a, b) =>
        sortOrder === "asc"
          ? (a.name || a.studentName || "").localeCompare(
              b.name || b.studentName || ""
            )
          : (b.name || b.studentName || "").localeCompare(
              a.name || a.studentName || ""
            )
      ),
    [students, sortOrder]
  );

  const toggleSort = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  const formatDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("en-IN");
  };

  const renderCourse = (s) =>
    s.courseName ||
    s.course?.title ||
    s.course?.name ||
    (typeof s.course === "string" ? s.course : "") ||
    "-";

  return (
    <div className="table-responsive bg-white rounded shadow-sm">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col">Photo</th>
            <th
              scope="col"
              style={{ cursor: "pointer", whiteSpace: "nowrap" }}
              onClick={toggleSort}
              title="Sort by name"
            >
              Student {sortOrder === "asc" ? "▲" : "▼"}
            </th>
            <th scope="col">Center</th>
            <th scope="col">Contact</th>
            <th scope="col">State / District / Address</th>
            <th scope="col">Course</th>
            <th scope="col">Exam / Board / Marks</th>
            <th scope="col">Session</th>
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
            sortedStudents.map((s) => {
              const id = s._id || s.id;

              const name = s.name || s.studentName || "-";
              const center =
                s.centerName ||
                s.franchiseName ||
                s.instituteName ||
                s.center ||
                "-";

              const gender = s.gender || "";
              const dobStr = formatDate(s.dob);

              const email = s.email || "-";
              const mobile = s.mobile || s.contact || "-";

              const state = s.state || "";
              const district = s.district || "";
              const fullAddress = s.address || "";
              const shortAddress =
                fullAddress && fullAddress.length > 40
                  ? fullAddress.slice(0, 40) + "…"
                  : fullAddress || "";

              const course = renderCourse(s);

              const examLine = s.examPassed || "-";
              const boardPart = s.board ? `, ${s.board}` : "";
              const marksPart = s.marksOrGrade ? ` (${s.marksOrGrade})` : "";
              const examBoardMarks = `${examLine}${boardPart}${marksPart}`;

              const session =
                (s.sessionStart || s.sessionEnd) &&
                `${formatDate(s.sessionStart)} – ${formatDate(
                  s.sessionEnd
                )}`;

              const photoSrc = imgUrl(s.photo || s.photoUrl);

              return (
                <tr key={id || name}>
                  {/* Photo box – clickable to open in new tab */}
                  <td>
                    <a
                      href={photoSrc}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          overflow: "hidden",
                          borderRadius: 8,
                          border: "1px solid #dee2e6",
                          backgroundColor: "#f8f9fa",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={photoSrc}
                          alt={name || "Student"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                          onError={(e) => {
                            e.currentTarget.src = DEV_PLACEHOLDER;
                          }}
                        />
                      </div>
                    </a>
                  </td>

                  <td>
                    <div className="fw-semibold">{name}</div>
                    <div className="small text-muted">
                      {gender || "-"}
                      {dobStr !== "-" ? ` • ${dobStr}` : ""}
                    </div>
                  </td>

                  <td>{center}</td>

                  <td>
                    <div className="small">{mobile}</div>
                    <div className="small text-muted">{email}</div>
                  </td>

                  <td>
                    <div className="small">
                      {state || "-"}
                      {district ? ` / ${district}` : ""}
                    </div>
                    {shortAddress && (
                      <div
                        className="small text-muted"
                        title={fullAddress || ""}
                      >
                        {shortAddress}
                      </div>
                    )}
                  </td>

                  <td>{course}</td>

                  <td className="small text-muted">{examBoardMarks}</td>

                  <td className="small text-muted">{session || "-"}</td>

                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => onEdit && onEdit(s)}
                      className="btn btn-sm btn-outline-primary me-2"
                    >
                      <i className="bi bi-pencil" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete && onDelete(id)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      <i className="bi bi-trash" /> Delete
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
