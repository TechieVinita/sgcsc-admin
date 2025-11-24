import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="bg-light border-end vh-100 d-flex flex-column p-3" style={{ width: '250px' }}>
      <h2 className="fs-4 fw-bold mb-4 text-primary">Admin Menu</h2>
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item mb-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active bg-primary text-white' : 'text-dark'} rounded`
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink
            to="/students"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active bg-primary text-white' : 'text-dark'} rounded`
            }
          >
            Students
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink
            to="/add-result"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active bg-primary text-white' : 'text-dark'} rounded`
            }
          >
            Add Result
          </NavLink>
        </li>

        {/* ✅ Add Gallery Link */}
        <li className="nav-item mb-2">
          <NavLink
            to="/gallery"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active bg-primary text-white' : 'text-dark'} rounded`
            }
          >
            Gallery
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
