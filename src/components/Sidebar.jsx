// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUserGraduate,
  FaClipboardList,
  FaImages,
  FaBook,
  FaBuilding,
  FaFilePdf,
  FaUsers,
  FaHandshake,
} from "react-icons/fa";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `nav-link d-flex align-items-center gap-2 ${
      isActive ? "active bg-primary text-white" : "text-dark"
    } rounded`;

  return (
    <div
      className="bg-light border-end vh-100 d-flex flex-column p-3"
      style={{ width: "260px" }}
    >
      <h2 className="fs-4 fw-bold mb-4 text-primary">Admin Panel</h2>

      <ul className="nav nav-pills flex-column mb-auto">
        {/* Dashboard */}
        <li className="nav-item mb-2">
          <NavLink to="/dashboard" className={linkClass}>
            <FaHome /> Dashboard
          </NavLink>
        </li>

        {/* Students */}
        <li className="nav-item mb-2">
          <NavLink to="/students" className={linkClass}>
            <FaUserGraduate /> Students
          </NavLink>
        </li>

        {/* Results (link to Add Result page, since that's what you have) */}
        <li className="nav-item mb-2">
          <NavLink to="/add-result" className={linkClass}>
            <FaClipboardList /> Results
          </NavLink>
        </li>

        {/* Courses */}
        <li className="nav-item mb-2">
          <NavLink to="/courses" className={linkClass}>
            <FaBook /> Courses
          </NavLink>
        </li>

        {/* Franchise */}
        <li className="nav-item mb-2">
          <NavLink to="/franchise" className={linkClass}>
            <FaBuilding /> Franchise
          </NavLink>
        </li>

        {/* Gallery */}
        <li className="nav-item mb-2">
          <NavLink to="/gallery" className={linkClass}>
            <FaImages /> Gallery
          </NavLink>
        </li>

        {/* Marksheet Templates */}
        <li className="nav-item mb-2">
          <NavLink to="/marksheet-templates" className={linkClass}>
            <FaFilePdf /> Marksheet Templates
          </NavLink>
        </li>

        {/* Institute Members */}
        <li className="nav-item mb-2">
          <NavLink to="/members" className={linkClass}>
            <FaUsers /> Institute Members
          </NavLink>
        </li>

        {/* Affiliations */}
        <li className="nav-item mb-2">
          <NavLink to="/affiliations" className={linkClass}>
            <FaHandshake /> Affiliations
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
