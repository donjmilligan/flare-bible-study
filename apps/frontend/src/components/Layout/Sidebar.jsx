import React, { useState, useRef, useEffect } from "react";
import { FaScroll, FaCross, FaHeart, FaClock, FaLeaf } from "react-icons/fa";
import "./Sidebar.css";

const ChevronIcon = ({ expanded }) => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke={expanded ? "#6366f1" : "#b0b7c3"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
      transition: "transform 0.2s",
    }}
    viewBox="0 0 24 24"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const MenuIcon = () => (
  <svg
    width="24"
    height="24"
    fill="none"
    stroke="#8a94a6"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const navSections = [
  {
    key: "flare",
    label: "Flare",
    icon: <FaScroll />,
    section: "Version 2.0 Demo",
    submenu: [
      { label: "Flare", href: "/dashboard/ecommerce" },
      {
        label: "HisPattern.com",
        href: "https://Hispattern.com",
        external: true,
      },
    ],
  },
  {
    key: "jesus",
    label: "Jesus",
    icon: <FaCross />,
    section: "Version 1.0 Subject Maps",
    submenu: [
      { label: "Old Testament Jesus 1", href: "/oldtestamentjesus1" },
      { label: "Old Testament Jesus 2", href: "/oldtestamentjesus2" },
    ],
  },
  {
    key: "promises",
    label: "Promises",
    icon: <FaHeart />,
    section: "Version 1.0 Subject Maps",
    submenu: [{ label: "Message of Hope", href: "/messageofhope" }],
  },
  {
    key: "prophecy",
    label: "Prophecy",
    icon: <FaClock />,
    section: "Version 1.0 Subject Maps",
    submenu: [
      { label: "Empires", href: "/empires" },
      { label: "Keys (todo)", href: "/keys" },
    ],
  },
  {
    key: "land",
    label: "Land of the Living",
    icon: <FaLeaf />,
    section: "Version 1.0 Subject Maps",
    submenu: [{ label: "What is Spirit", href: "/whatisSpirit" }],
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSection, setOpenSection] = useState("flare");
  const submenuRefs = useRef({});
  const [submenuHeights, setSubmenuHeights] = useState({});

  useEffect(() => {
    const newHeights = {};
    navSections.forEach((section) => {
      const ref = submenuRefs.current[section.key];
      newHeights[section.key] =
        openSection === section.key && !collapsed && ref ? ref.scrollHeight : 0;
    });
    setSubmenuHeights(newHeights);
  }, [openSection, collapsed]);

  // Group sections by their section title
  const groupedSections = navSections.reduce((acc, section) => {
    if (!acc[section.section]) acc[section.section] = [];
    acc[section.section].push(section);
    return acc;
  }, {});

  return (
    <div className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          🔥
        </button>
        {!collapsed && <h2 className="sidebar-title">Flare Bible Study</h2>}
      </div>
      <nav className="sidebar-nav">
        {Object.entries(groupedSections).map(([sectionTitle, sections]) => (
          <div className="nav-section" key={sectionTitle}>
            <div className="nav-section-title">{sectionTitle}</div>
            <ul>
              {sections.map((section) => (
                <li key={section.key}>
                  <div
                    className={`nav-link nav-link-expand${openSection === section.key ? " active" : ""}`}
                    onClick={() =>
                      setOpenSection(
                        openSection === section.key ? null : section.key,
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <span className="nav-icon">{section.icon}</span>
                    {!collapsed && (
                      <span
                        className="nav-text"
                        style={{
                          color:
                            openSection === section.key ? "#6366f1" : undefined,
                        }}
                      >
                        {section.label}
                      </span>
                    )}
                    {!collapsed && (
                      <span className="nav-chevron">
                        <ChevronIcon expanded={openSection === section.key} />
                      </span>
                    )}
                  </div>
                  <ul
                    className="sub-menu"
                    ref={(el) => (submenuRefs.current[section.key] = el)}
                    style={{
                      maxHeight: submenuHeights[section.key] || 0,
                      overflow: "hidden",
                      background: "#f7f9fb",
                      margin: 0,
                      padding: "0 0 0 48px",
                      border: "none",
                      transition:
                        "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {section.submenu.map((item, idx) => (
                      <li key={item.label}>
                        {item.external ? (
                          <a
                            className="nav-link"
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.label}
                          </a>
                        ) : (
                          <a href={item.href} className="sub-nav-link">
                            {item.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
