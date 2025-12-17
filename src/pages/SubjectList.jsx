// src/pages/SubjectList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

export default function SubjectList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---- helpers -------------------------------------------------

  // Normalise a course object from /courses into { id, name }
  const normaliseCourse = (c) => {
    if (!c || typeof c !== "object") return null;
    const id = c._id || c.id;
    if (!id) return null;
    const name = c.title || c.name || "Untitled course";
    return { id: String(id), name };
  };

  // Extract "courseId" from a subject in a consistent way
  const getSubjectCourseId = (s) => {
    if (!s) return "";
    if (s.course && typeof s.course === "object") {
      // populated course object
      const id = s.course._id || s.course.id;
      return id ? String(id) : "";
    }
    if (typeof s.course === "string" || typeof s.course === "number") {
      return String(s.course);
    }
    if (s.courseId) return String(s.courseId);
    return "";
  };

  // Get a readable course name from a subject + courseMap
  const getSubjectCourseName = (s, courseMap) => {
    // direct field from backend if present
    if (s.courseName) return s.courseName;

    // populated course object
    if (s.course && typeof s.course === "object") {
      return (
        s.course.title ||
        s.course.name ||
        courseMap[String(s.course._id || s.course.id)] ||
        "-"
      );
    }

    const id = getSubjectCourseId(s);
    if (!id) return "-";
    return courseMap[id] || "-";
  };

  // ---- data loading --------------------------------------------

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [courseRes, subjectRes] = await Promise.all([
        API.get("/courses"),
        API.get("/subjects"),
      ]);


      const courseData = courseRes.data;
const subjectData = subjectRes.data;

      const courseArr = Array.isArray(courseData)
        ? courseData
        : Array.isArray(courseData?.data)
        ? courseData.data
        : [];

      const subjectArr = Array.isArray(subjectData)
        ? subjectData
        : Array.isArray(subjectData?.data)
        ? subjectData.data
        : [];


      setCourses(courseArr);
      setSubjects(subjectArr);
    } catch (err) {
      console.error("load subjects/courses", err);
      setError(
        err.userMessage ||
          "Failed to load subjects or courses. Check /api/subjects & /api/courses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map of courseId -> courseName (keys always strings)
  const courseMap = useMemo(() => {
    const map = {};
    courses.forEach((c) => {
      const norm = normaliseCourse(c);
      if (!norm) return;
      map[norm.id] = norm.name;
    });
    return map;
  }, [courses]);

  // Filter subjects by selected course (using normalised courseId)
  const filteredSubjects = useMemo(() => {
    if (selectedCourse === "all") return subjects;
    return subjects.filter(
      (s) => getSubjectCourseId(s) === String(selectedCourse)
    );
  }, [subjects, selectedCourse]);

  // ---- actions -------------------------------------------------

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      await API.delete(`/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => (s._id || s.id) !== id));
    } catch (err) {
      console.error("delete subject", err);
      alert(err.userMessage || "Failed to delete subject");
    }
  };

  const handleEdit = (s) => {
    const id = s._id || s.id;
    navigate(`/subjects/create?id=${id}`);
  };

  const handleAdd = () => {
    navigate("/subjects/create");
  };

  // ---- render --------------------------------------------------

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="flex-grow-1">
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h2 className="mb-0">Subjects</h2>
              <div className="small text-muted">
                List of subjects grouped by course.
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={loadData}
                disabled={loading}
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>
              <button className="btn btn-primary" onClick={handleAdd}>
                Add Subject
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Filter by Course</label>
                  <select
                    className="form-select"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="all">All Courses</option>
                    {courses.map((c) => {
                      const norm = normaliseCourse(c);
                      if (!norm) return null;
                      return (
                        <option key={norm.id} value={norm.id}>
                          {norm.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-4">Loading subjects…</div>
              ) : filteredSubjects.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  No subjects found. Try changing the filter or add a new
                  subject.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-primary">
                      <tr>
                        <th>Course</th>
                        <th>Subject Name</th>
                        <th className="text-center">Max Marks</th>
                        <th className="text-center">Min Marks</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubjects.map((s) => {
                        const courseName = getSubjectCourseName(
                          s,
                          courseMap
                        );
                        return (
                          <tr key={s._id || s.id}>
                            <td>{courseName}</td>
                            <td>{s.name || s.subjectName || "-"}</td>
                            <td className="text-center">
                              {s.maxMarks ?? s.max ?? "-"}
                            </td>
                            <td className="text-center">
                              {s.minMarks ?? s.min ?? "-"}
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleEdit(s)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleDelete(s._id || s.id)
                                }
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
