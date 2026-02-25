// src/pages/AddResults.jsx
import { useEffect, useState } from "react";
import API from "../api/axiosInstance";

export default function AddResults() {
  const [course, setCourse] = useState("");

  const [loadingCourses, setLoadingCourses] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info | success | danger

  const [students, setStudents] = useState([]);
  const [rollNo, setRollNo] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState({});
  

  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await API.get("/courses");

        const list =
          Array.isArray(res.data?.data) ? res.data.data :
          Array.isArray(res.data) ? res.data : [];

        setCourses(list);
      } catch (err) {
        console.error("fetch courses error:", err);
        setMessageType("danger");
        setMessage("Failed to load courses list");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);


useEffect(() => {
  const fetchRollNos = async () => {
    try {
      const res = await API.get("/students/rollnos");
      setStudents(res.data.data || []);
    } catch (err) {
      console.error("fetch roll nos error", err);
    }
  };

  fetchRollNos();
}, []);


  /* ================= VALIDATION ================= */
  const validate = () => {

    if (!courseId) {
      setMessageType("danger");
      setMessage("Please select a course.");
      return false;
    }

    if (subjects.length === 0) {
      setMessageType("danger");
      setMessage("No subjects found for this course.");
      return false;
    }


    if (!rollNo.trim()) {
      setMessageType("danger");
      setMessage("Roll No is required.");
      return false;
    }
    if (!course) {
      setMessageType("danger");
      setMessage("Please select a course.");
      return false;
    }
    return true;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        rollNumber: rollNo,
        studentId: selectedStudent?._id,
        courseId,
        subjects: Object.entries(marks).map(([name, m]) => ({
          name,
          objective: Number(m.objective || 0),
          practical: Number(m.practical || 0)
        }))
      };

      await API.post("/results", payload);


      setMessageType("success");
      setMessage("Result added successfully!");

      setRollNo("");
      setCourse("");
    } catch (err) {
      console.error("add result error:", err);
      setMessageType("danger");
      setMessage(err.userMessage || "Failed to add result");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="flex-grow-1">
        <div className="container-fluid p-4">
          <h2 className="mb-4 fw-bold">Create Result</h2>

          {message && (
            <div className={`alert alert-${messageType}`} role="alert">
              {message}
            </div>
          )}

          <div className="card shadow-sm" style={{ maxWidth: 520 }}>
            <div className="card-body">
              <form onSubmit={handleSubmit}>

                {/* Roll No */}
                  <div className="mb-3">
                    <label className="form-label">Roll No</label>
                    
                      <select
                        className="form-select"
                        value={rollNo}
                        onChange={(e) => {
                          const rn = e.target.value;
                          setRollNo(rn);

                          const student = students.find(
                            s => String(s.rollNumber) === String(rn)
                          );

                          setSelectedStudent(student || null);
                        }}
                        required
                      >
                        <option value="">Select Roll No</option>

                        {students.map(s => (
                          <option key={s._id} value={s.rollNumber}>
                            {s.rollNumber} — {s.name}
                          </option>
                        ))}
                      </select>

                  </div>

                {/* Course SELECT */}
                <div className="mb-3">
                  <label className="form-label">Course</label>
                <select
                  className="form-select"
                  value={courseId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setCourseId(id);

                    const courseObj = courses.find(c => c._id === id);
                    if (courseObj?.subjects) {
                      setSubjects(courseObj.subjects);

                      // init marks
                      const init = {};
                      courseObj.subjects.forEach(sub => {
                        init[sub.name] = { objective: "", practical: "" };
                      });
                      setMarks(init);
                    }
                  }}
                  required
                >
                  <option value="">Select course</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                </div>



                {subjects.length > 0 && (
                  <div className="mt-4">
                    <h5>Subject Marks</h5>

                    {subjects.map(sub => (
                      <div key={sub.name} className="row mb-2">
                        <div className="col-md-4">
                          <strong>{sub.name}</strong>
                        </div>

                        <div className="col-md-4">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Objective Marks"
                            value={marks[sub.name]?.objective || ""}
                            onChange={(e) =>
                              setMarks(prev => ({
                                ...prev,
                                [sub.name]: {
                                  ...prev[sub.name],
                                  objective: e.target.value
                                }
                              }))
                            }
                          />
                        </div>

                        {sub.hasPractical && (
                          <div className="col-md-4">
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Practical Marks"
                              value={marks[sub.name]?.practical || ""}
                              onChange={(e) =>
                                setMarks(prev => ({
                                  ...prev,
                                  [sub.name]: {
                                    ...prev[sub.name],
                                    practical: e.target.value
                                  }
                                }))
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}



                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Result"}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
