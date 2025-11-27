// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  FaHome,
  FaUserGraduate,
  FaClipboardList,
  FaImages,
  FaBook,
  FaBuilding,
  FaFilePdf,
  FaChevronDown,
  FaChevronRight,
  FaUsers,
  FaHandshake,
} from "react-icons/fa";

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);
  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div
      className="bg-light border-end vh-100 d-flex flex-column p-3"
      style={{ width: "260px" }}
    >
      <h2 className="fs-4 fw-bold mb-4 text-primary">Admin Panel</h2>

      <ul className="nav nav-pills flex-column mb-auto">
        {/* Dashboard */}
        <li className="nav-item mb-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-2 ${
                isActive ? "active bg-primary text-white" : "text-dark"
              } rounded`
            }
          >
            <FaHome /> Dashboard
          </NavLink>
        </li>

        {/* Students */}
        <li className="nav-item mb-2">
          <button
            className="btn btn-toggle align-items-center rounded text-start w-100 d-flex justify-content-between text-dark"
            onClick={() => toggleMenu("students")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaUserGraduate /> Students
            </span>
            {openMenu === "students" ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {openMenu === "students" && (
            <ul className="btn-toggle-nav list-unstyled fw-normal pb-1 ps-4 pt-2">
              <li className="mb-2">
                <NavLink
                  to="/students"
                  className={({ isActive }) =>
                    `nav-link small ${
                      isActive ? "active text-primary fw-bold" : "text-dark"
                    }`
                  }
                >
                  View Students
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Results */}
        <li className="nav-item mb-2">
          <button
            className="btn btn-toggle w-100 text-start d-flex justify-content-between text-dark"
            onClick={() => toggleMenu("results")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaClipboardList /> Results
            </span>
            {openMenu === "results" ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {openMenu === "results" && (
            <ul className="btn-toggle-nav list-unstyled pb-1 ps-4 pt-2">
              <li className="mb-2">
                <NavLink
                  to="/add-result"
                  className={({ isActive }) =>
                    `nav-link small ${
                      isActive ? "active text-primary fw-bold" : "text-dark"
                    }`
                  }
                >
                  Add Result
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Courses */}
        <li className="nav-item mb-2">
          <button
            className="btn btn-toggle w-100 text-start d-flex justify-content-between text-dark"
            onClick={() => toggleMenu("courses")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaBook /> Courses
            </span>
            {openMenu === "courses" ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {openMenu === "courses" && (
            <ul className="btn-toggle-nav list-unstyled pb-1 ps-4 pt-2">
              <li className="mb-2">
                <NavLink
                  to="/courses"
                  className={({ isActive }) =>
                    `nav-link small ${
                      isActive ? "active text-primary fw-bold" : "text-dark"
                    }`
                  }
                >
                  Manage Courses
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Franchise */}
        <li className="nav-item mb-2">
          <button
            className="btn btn-toggle w-100 text-start d-flex justify-content-between text-dark"
            onClick={() => toggleMenu("franchise")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaBuilding /> Franchise
            </span>
            {openMenu === "franchise" ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {openMenu === "franchise" && (
            <ul className="btn-toggle-nav list-unstyled pb-1 ps-4 pt-2">
              <li className="mb-2">
                <NavLink
                  to="/franchise"
                  className={({ isActive }) =>
                    `nav-link small ${
                      isActive ? "active text-primary fw-bold" : "text-dark"
                    }`
                  }
                >
                  Manage Franchise
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Gallery */}
        <li className="nav-item mb-2">
          <NavLink
            to="/gallery"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-2 ${
                isActive ? "active bg-primary text-white" : "text-dark"
              } rounded`
            }
          >
            <FaImages /> Gallery
          </NavLink>
        </li>

        {/* Marksheet Templates */}
        <li className="nav-item mb-2">
          <NavLink
            to="/marksheet-templates"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-2 ${
                isActive ? "active bg-primary text-white" : "text-dark"
              } rounded`
            }
          >
            <FaFilePdf /> Marksheet Templates
          </NavLink>
        </li>

        {/* Website content: Members + Affiliations */}
        <li className="nav-item mb-2">
          <button
            className="btn btn-toggle w-100 text-start d-flex justify-content-between text-dark"
            onClick={() => toggleMenu("website")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaUsers /> Website Content
            </span>
            {openMenu === "website" ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {openMenu === "website" && (
            <ul className="btn-toggle-nav list-unstyled pb-1 ps-4 pt-2">
              <li className="mb-2">
                <NavLink
                  to="/members"
                  className={({ isActive }) =>
                    `nav-link small ${
                      isActive ? "active text-primary fw-bold" : "text-dark"
                    }`
                  }
                >
                  Institute Members
                </NavLink>
              </li>
              <li className="mb-2">
                <NavLink
                  to="/affiliations"
                  className={({ isActive }) =>
                    `nav-link small ${
                      isActive ? "active text-primary fw-bold" : "text-dark"
                    }`
                  }
                >
                  <FaHandshake className="me-1" /> Affiliations
                </NavLink>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}
