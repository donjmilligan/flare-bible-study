"use client";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

// SVG Chevron Icon
const ChevronIcon = ({ open }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      transform: open ? "rotate(90deg)" : "rotate(0deg)",
      transition: "transform 0.2s",
      display: "inline-block",
      verticalAlign: "middle",
    }}
  >
    <path
      d="M8 7l5 4-5 4"
      stroke="#556ee6"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Add section headers and update nav items
const navSections = [
  {
    header: "VERSION 2.0 DEMO",
    items: [
      {
        title: "Dashboard",
        icon: <i className="fas fa-clipboard"></i>,
        submenu: [
          { title: "Flare", path: "/flare" },
          {
            title: "HisPattern.com",
            path: "https://Hispattern.com",
            external: true,
          },
        ],
      },
    ],
  },
  {
    header: "SUBJECT MAPS",
    items: [
      {
        title: "Jesus",
        icon: <i className="fas fa-cross"></i>,
        submenu: [
          { title: "Old Testament Jesus 1", path: "/jesus/ot1" },
          { title: "Old Testament Jesus 2", path: "/jesus/ot2" },
        ],
      },
      {
        title: "Promises",
        icon: <i className="fas fa-heart"></i>,
        submenu: [
          { title: "Messages of Hope", path: "/promises/messages-of-hope" },
        ],
      },
      {
        title: "Prophecy",
        icon: <i className="fas fa-clock"></i>,
        submenu: [
          { title: "Empires", path: "/empire" },
          { title: "Key(todo)", path: "/keys" },
        ],
      },
      {
        title: "Land of the Living",
        icon: <i className="fas fa-leaf"></i>,
        submenu: [{ title: "What is Spirit", path: "/whatisspirit" }],
      },
    ],
  },
];

import { useState } from "react";

const settingsNavItems = [
  { title: "Settings", id: "settings" },
  { title: "About", id: "about" },
  { title: "How To", id: "howto" },
];

const Sidebar = ({
  collapsed,
  onToggleSidebar,
  activeSubItem,
  onSubNavClick,
  currentPath,
}) => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);

  const handleMenuClick = (item) => {
    if (item.submenu && item.submenu.length > 0) {
      setExpandedMenu(expandedMenu === item.title ? null : item.title);
    }
  };

  return (
    <div className="sidebar-container">
      {/* Main Sidebar */}
      <div className={`main-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">🔥</div>
          {!collapsed && <span className="brand-text">Flare Bible Study</span>}
        </div>
        <div className="sidebar-content">
          {/* Debug: Test external link */}
          <a
            href="https://Hispattern.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              margin: "12px 0",
              color: "#ff9800",
              fontWeight: 600,
            }}
          >
            Test External
          </a>
          {navSections.map((section) => (
            <div key={section.header} className="sidebar-section">
              {!collapsed && (
                <div className="sidebar-section-header">{section.header}</div>
              )}
              <ul className="sidebar-menu">
                {section.items.map((item) => (
                  <li
                    key={item.title}
                    className={`sidebar-menu-item${expandedMenu === item.title ? " active-parent" : ""}`}
                  >
                    <div
                      className={`sidebar-menu-button${expandedMenu === item.title ? " active" : ""}`}
                      onClick={() => handleMenuClick(item)}
                      style={{
                        cursor:
                          item.submenu && item.submenu.length > 0
                            ? "pointer"
                            : "default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span
                          className="sidebar-menu-icon"
                          style={{ fontSize: 22 }}
                        >
                          {item.icon}
                        </span>
                        <span className="sidebar-menu-text">{item.title}</span>
                      </span>
                      {item.submenu &&
                        item.submenu.length > 0 &&
                        !collapsed && (
                          <span className="sidebar-menu-chevron">
                            <ChevronIcon open={expandedMenu === item.title} />
                          </span>
                        )}
                      {item.submenu && item.submenu.length > 0 && collapsed && (
                        <span className="sidebar-menu-chevron" />
                      )}
                    </div>
                    {/* Submenu */}
                    {item.submenu &&
                      item.submenu.length > 0 &&
                      expandedMenu === item.title &&
                      !collapsed && (
                        <div className="sidebar-submenu-anim expanded">
                          <div className="sidebar-submenu-area">
                            <ul className="sidebar-submenu">
                              {item.submenu.map((sub) => (
                                <li
                                  key={sub.path}
                                  className="sidebar-submenu-item"
                                >
                                  {sub.external ? (
                                    <a
                                      href={sub.path}
                                      className="sidebar-submenu-link"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {sub.title}
                                    </a>
                                  ) : (
                                    <Link
                                      to={sub.path}
                                      className={`sidebar-submenu-link ${location.pathname === sub.path ? "active" : ""}`}
                                    >
                                      {sub.title}
                                    </Link>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// SubSidebar as a separate export
export const SubSidebar = ({ activeSubItem, onSubNavClick }) => (
  <div className="sub-sidebar">
    <div className="sub-sidebar-header">
      <h2 className="sub-sidebar-title">Customize</h2>
    </div>
    <div className="sub-sidebar-content">
      {settingsNavItems.map((item) => (
        <button
          key={item.id}
          className={`sub-sidebar-button ${activeSubItem === item.id ? "active" : ""}`}
          onClick={() => onSubNavClick(item.id)}
        >
          <span className="sub-sidebar-text">{item.title}</span>
        </button>
      ))}
    </div>
  </div>
);

Sidebar.SubSidebar = SubSidebar;

export default Sidebar;
