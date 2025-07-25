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
  const [showOverlay, setShowOverlay] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSubNavClick = (itemId) => {
    setActiveSubItem(itemId);
    setShowOverlay(true);
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
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
            <div className="sub-sidebar-wrapper">
              {/* Sub-sidebar moved here */}
              <Sidebar.SubSidebar
                activeSubItem={activeSubItem}
                onSubNavClick={handleSubNavClick}
              />
            </div>
            <main
              className={`main-content${showOverlay && activeSubItem === "settings" ? " with-drawer" : ""}`}
            >
              {/* Settings Drawer */}
              {showOverlay && activeSubItem === "settings" && (
                <div className="settings-drawer">
                  <SettingsOverlay onClose={handleCloseOverlay} />
                </div>
              )}
              {/* Main Content (always rendered) */}
              <div
                className={`main-content-inner${showOverlay && activeSubItem === "settings" ? " shrunk" : ""}`}
              >
                {children}
              </div>
            </main>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

const renderOverlayContent = (activeSubItem, onClose) => {
  switch (activeSubItem) {
    case "settings":
      return <SettingsOverlay onClose={onClose} />;
    case "account-security":
      return <AccountSecurityOverlay onClose={onClose} />;
    case "notifications":
      return <NotificationsOverlay onClose={onClose} />;
    default:
      return null;
  }
};

// Overlay Components
const SettingsOverlay = ({ onClose }) => (
  <div className="overlay-page">
    <div className="overlay-header">
      <h1>Settings</h1>
      <button className="close-btn" onClick={onClose}>
        ×
      </button>
    </div>
    <div className="overlay-body">
      <div className="form-group">
        <label>Zoom</label>
        <div style={{ display: "flex", gap: 8 }}>
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
      <div className="form-group">
        <label>Text Size</label>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-outline"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("d3-text-size", { detail: 1 }),
              )
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
  </div>
);

const ProfileOverlay = ({ onClose }) => (
  <div className="overlay-page">
    <div className="overlay-header">
      <h1>Profile</h1>
      <button className="close-btn" onClick={onClose}>
        ×
      </button>
    </div>
    <div className="overlay-body">
      <div className="form-group">
        <label>Full Name</label>
        <input type="text" placeholder="Enter your full name" />
      </div>
      <div className="form-group">
        <label>Username</label>
        <input type="text" placeholder="Enter username" />
      </div>
      <div className="form-group">
        <label>Bio</label>
        <input type="text" placeholder="Tell us about yourself" />
      </div>
      <button className="btn btn-primary">Save Changes</button>
    </div>
  </div>
);

const AccountSecurityOverlay = ({ onClose }) => (
  <div className="overlay-page">
    <div className="overlay-header">
      <h1>Account Security</h1>
      <button className="close-btn" onClick={onClose}>
        ×
      </button>
    </div>
    <div className="overlay-body">
      <section className="security-section">
        <h2>Account Information</h2>
        <div className="info-item">
          <div>
            <h3>Email address</h3>
            <p>s***n@hey.com</p>
          </div>
        </div>
        <div className="info-item">
          <div>
            <h3>Wallet address</h3>
            <p>Log in with your preferred wallet address</p>
          </div>
          <button className="btn btn-outline">Connect wallet</button>
        </div>
      </section>

      <section className="security-section">
        <h2>Security Settings</h2>
        <div className="info-item">
          <div>
            <h3>Google Authenticator (2FA)</h3>
            <p>
              Use the Authenticator to get verification codes for better
              security.
            </p>
          </div>
          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
        <div className="info-item">
          <div>
            <h3>Password</h3>
            <p>Set a unique password for better protection</p>
          </div>
          <button className="btn btn-outline">Set password</button>
        </div>
      </section>
    </div>
  </div>
);

const NotificationsOverlay = ({ onClose }) => (
  <div className="overlay-page">
    <div className="overlay-header">
      <h1>Notifications</h1>
      <button className="close-btn" onClick={onClose}>
        ×
      </button>
    </div>
    <div className="overlay-body">
      <div className="notification-item">
        <div>
          <h3>Email Notifications</h3>
          <p>Receive notifications via email</p>
        </div>
        <label className="switch">
          <input type="checkbox" />
          <span className="slider"></span>
        </label>
      </div>
      <div className="notification-item">
        <div>
          <h3>Push Notifications</h3>
          <p>Receive push notifications</p>
        </div>
        <label className="switch">
          <input type="checkbox" defaultChecked />
          <span className="slider"></span>
        </label>
      </div>
      <div className="notification-item">
        <div>
          <h3>Trading Alerts</h3>
          <p>Get alerts for trading activities</p>
        </div>
        <label className="switch">
          <input type="checkbox" defaultChecked />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  </div>
);

export default Layout;
