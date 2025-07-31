"use client";

import { useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "./Layout.css";

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSubItem, setActiveSubItem] = useState(null);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSubNavClick = (itemId) => {
    setActiveSubItem(itemId);
  };

  const handleCloseSubSidebar = () => {
    setActiveSubItem(null);
  };

  return (
    <div className="layout-root">
      <div className="layout-flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          activeSubItem={activeSubItem}
          onSubNavClick={handleSubNavClick}
          currentPath={location.pathname}
        />
        <div className={`layout-main ${sidebarCollapsed ? "expanded" : ""}`}>
          <Navbar
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
          />
          <div className="layout-content-flex">
            <div className="sub-sidebar-wrapper always">
              <Sidebar.SubSidebar
                activeSubItem={activeSubItem}
                onSubNavClick={handleSubNavClick}
              />
            </div>
            {activeSubItem && (
              <div className="subsidebar-drawer">
                <button
                  className="close-btn"
                  onClick={handleCloseSubSidebar}
                  style={{ float: "right", margin: 8 }}
                >
                  ×
                </button>
                {renderSubSidebarContent(activeSubItem)}
              </div>
            )}
            <main className={`main-content${activeSubItem ? " shrunk" : ""}`}>
              <div className="main-content-inner">{children}</div>
            </main>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

function renderSubSidebarContent(activeSubItem) {
  switch (activeSubItem) {
    case "settings":
      return <SettingsPanel />;
    case "about":
      return <AboutPanel />;
    case "howto":
      return <HowToPanel />;
    default:
      return null;
  }
}

const SettingsPanel = () => (
  <div style={{ padding: 16 }}>
    <h2>Settings</h2>
    <div style={{ marginBottom: 24 }}>
      <label style={{ fontWeight: 500 }}>Zoom</label>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          className="btn btn-outline"
          onClick={() => window.dispatchEvent(new CustomEvent("d3-zoom-in"))}
        >
          Zoom In
        </button>
        <button
          className="btn btn-outline"
          onClick={() => window.dispatchEvent(new CustomEvent("d3-zoom-out"))}
        >
          Zoom Out
        </button>
      </div>
    </div>
    <div>
      <label style={{ fontWeight: 500 }}>Text Size</label>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          className="btn btn-outline"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("d3-text-size", { detail: 1 }))
          }
        >
          A+
        </button>
        <button
          className="btn btn-outline"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("d3-text-size", { detail: -1 }),
            )
          }
        >
          A-
        </button>
      </div>
    </div>
  </div>
);

const AboutPanel = () => (
  <div style={{ padding: 16 }}>
    <h2>About</h2>
    <p>This is the About panel content.</p>
  </div>
);

const HowToPanel = () => (
  <div style={{ padding: 16 }}>
    <h2>How To</h2>
    <p>This is the How To panel content.</p>
  </div>
);

export default Layout;
