"use client";
import "./Navbar.css";

const Navbar = ({ sidebarCollapsed, onToggleSidebar }) => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? (
            // Chevron right
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          ) : (
            // Chevron left
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          )}
        </button>
        <div className="navbar-brand">
          <h2>
            Fl
            <i
              className="fas fa-fire fa-rotate-45"
              style={{ color: "#ff9800", fontSize: 22, margin: "0 4px" }}
            ></i>
            re
          </h2>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
