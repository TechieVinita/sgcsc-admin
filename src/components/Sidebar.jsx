// src/components/Sidebar.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaBuilding,
  FaUserGraduate,
  FaBook,
  FaUsers,
  FaImages,
  FaClipboardList,
  FaIdCard,
  FaCertificate,
  FaBookOpen,
  FaTasks,
  FaCog,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const mainLinkClass = ({ isActive }) =>
    `nav-link d-flex align-items-center gap-2 ${
      isActive ? "active bg-primary text-white" : "text-dark"
    } rounded py-2`;

  const subLinkClass = ({ isActive }) =>
    `nav-link small d-flex align-items-center ${
      isActive ? "text-primary fw-semibold" : "text-dark"
    } py-1`;

  return (
    <div
      className="bg-light border-end vh-100 d-flex flex-column p-3"
      style={{ width: "260px" }}
    >
      <h2 className="fs-4 fw-bold mb-4 text-primary">Admin Panel</h2>

      <ul className="nav nav-pills flex-column mb-auto">
        {/* 1. Dashboard ----------------------------------------------------- */}
        <li className="nav-item mb-2">
          <NavLink to="/dashboard" className={mainLinkClass}>
            <FaHome />
            <span>Dashboard</span>
          </NavLink>
        </li>

        {/* 2. Franchise ----------------------------------------------------- */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("franchise")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaBuilding />
              Franchise
            </span>
            {openMenu === "franchise" ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {openMenu === "franchise" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/franchise/create" className={subLinkClass}>
                  Create Franchise
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/franchise/list" className={subLinkClass}>
                  List Franchise
                </NavLink>
              </li>

              <li className="mb-1">
                <NavLink to="/franchise-applications" className={subLinkClass}>
                  Franchise Applications
                </NavLink>
              </li>


            </ul>
          )}
        </li>

        {/* 3. Students ------------------------------------------------------ */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("students")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaUserGraduate />
              Students
            </span>
            {openMenu === "students" ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {openMenu === "students" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                {/* You can decide later if this opens a separate page
                    or the list page with a pre-opened modal */}
                <NavLink to="/students/add" className={subLinkClass}>
                  Add Student
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/students" className={subLinkClass}>
                  Student List
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* 4. Courses ------------------------------------------------------- */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("courses")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaBook />
              Courses
            </span>
            {openMenu === "courses" ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {openMenu === "courses" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/courses/create" className={subLinkClass}>
                  Create Course
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/subjects/create" className={subLinkClass}>
                  Create Subject
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/subjects" className={subLinkClass}>
                  List Subjects by Course
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/courses" className={subLinkClass}>
                  Course List
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* 5. Institute Members -------------------------------------------- */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("members")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaUsers />
              Institute Members
            </span>
            {openMenu === "members" ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {openMenu === "members" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/members/add" className={subLinkClass}>
                  Add Member
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/members" className={subLinkClass}>
                  List Members
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* 6. Gallery ------------------------------------------------------- */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("gallery")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaImages />
              Gallery
            </span>
            {openMenu === "gallery" ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {openMenu === "gallery" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/gallery/categories/create" className={subLinkClass}>
                  Add Category
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/gallery" className={subLinkClass}>
                  List Images
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* 7. Result -------------------------------------------------------- */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("results")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaClipboardList />
              Result
            </span>
            {openMenu === "results" ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {openMenu === "results" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/results/create" className={subLinkClass}>
                  Create Result
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/results" className={subLinkClass}>
                  Get Result
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* 8. Admit Card ---------------------------------------------------- */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("admit")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaIdCard />
              Admit Card
            </span>
            {openMenu === "admit" ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {openMenu === "admit" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/admit-cards/create" className={subLinkClass}>
                  Generate Admit Card
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/admit-cards" className={subLinkClass}>
                  List Admit Cards
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* 9. Certificate --------------------------------------------------- */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("certificates")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaCertificate />
              Certificate
            </span>
            {openMenu === "certificates" ? (
              <FaChevronDown />
            ) : (
              <FaChevronRight />
            )}
          </button>

          {openMenu === "certificates" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/certificates/create" className={subLinkClass}>
                  Create Certificate
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/certificates" className={subLinkClass}>
                  Get Certificate
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* 10. Study Material ---------------------------------------------- */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("study")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaBookOpen />
              Study Material
            </span>
            {openMenu === "study" ? <FaChevronDown /> : <FaChevronRight />}
          </button>

          {openMenu === "study" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/study-material/upload" className={subLinkClass}>
                  Upload
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/study-material" className={subLinkClass}>
                  List
                </NavLink>
              </li>

            </ul>
          )}
        </li>

        {/* 11. Assignment --------------------------------------------------- */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("assignments")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaTasks />
              Assignment
            </span>
            {openMenu === "assignments" ? (
              <FaChevronDown />
            ) : (
              <FaChevronRight />
            )}
          </button>

          {openMenu === "assignments" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/assignments/upload" className={subLinkClass}>
                  Upload
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/assignments" className={subLinkClass}>
                  List
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* 12. Settings (placeholders for now) ------------------------------ */}
        <li className="nav-item mb-2">
          <button
            type="button"
            className="btn btn-toggle w-100 text-start d-flex justify-content-between align-items-center text-dark"
            onClick={() => toggleMenu("settings")}
          >
            <span className="d-flex align-items-center gap-2">
              <FaCog />
              Settings
            </span>
            {openMenu === "settings" ? (
              <FaChevronDown />
            ) : (
              <FaChevronRight />
            )}
          </button>

          {openMenu === "settings" && (
            <ul className="btn-toggle-nav list-unstyled ps-4 pt-2 pb-1">
              <li className="mb-1">
                <NavLink to="/settings/header" className={subLinkClass}>
                  Header
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/settings/footer" className={subLinkClass}>
                  Footer
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/settings/social" className={subLinkClass}>
                  Social Links
                </NavLink>
              </li>
              <li className="mb-1">
                <NavLink to="/settings/branding" className={subLinkClass}>
                  Logo & Branding
                </NavLink>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}
