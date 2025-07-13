import React, { useState } from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";

const Sidebar = ({ collapsed }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (itemName) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {collapsed ? (
          <div className="flare-icon">🔥</div>
        ) : (
          <h2>Flare Bible Study</h2>
        )}
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <div
              className="nav-item-header"
              onClick={() => toggleExpanded("dashboard")}
            >
              <a href="/dashboard" className="nav-link">
                <span className="nav-icon">📊</span>
                <span className="nav-text">Dashboard</span>
              </a>
              <span
                className={`caret ${expandedItems.dashboard ? "expanded" : ""}`}
              >
                ▼
              </span>
            </div>
            {expandedItems.dashboard && (
              <ul className="sub-menu">
                <li>
                  <a href="/dashboard/overview" className="sub-nav-link">
                    <span className="sub-nav-icon">📈</span>
                    <span className="sub-nav-text">Overview</span>
                  </a>
                </li>
                <li>
                  <a href="/dashboard/analytics" className="sub-nav-link">
                    <span className="sub-nav-icon">📊</span>
                    <span className="sub-nav-text">Analytics</span>
                  </a>
                </li>
                <li>
                  <a href="/dashboard/reports" className="sub-nav-link">
                    <span className="sub-nav-icon">📋</span>
                    <span className="sub-nav-text">Reports</span>
                  </a>
                </li>
              </ul>
            )}
          </li>
          <li>
            <div
              className="nav-item-header"
              onClick={() => toggleExpanded("bible")}
            >
              <a href="/bible" className="nav-link">
                <span className="nav-icon">📖</span>
                <span className="nav-text">Bible Study</span>
              </a>
              <span
                className={`caret ${expandedItems.bible ? "expanded" : ""}`}
              >
                ▼
              </span>
            </div>
            {expandedItems.bible && (
              <ul className="sub-menu">
                <li>
                  <a href="/oldtestamentjesus1" className="sub-nav-link">
                    <span className="sub-nav-icon">📜</span>
                    <span className="sub-nav-text">Old Testament</span>
                  </a>
                </li>
                <li>
                  <a href="/bible/new-testament" className="sub-nav-link">
                    <span className="sub-nav-icon">📖</span>
                    <span className="sub-nav-text">New Testament</span>
                  </a>
                </li>
                <li>
                  <a href="/bible/verses" className="sub-nav-link">
                    <span className="sub-nav-icon">🎯</span>
                    <span className="sub-nav-text">Daily Verses</span>
                  </a>
                </li>
                <li>
                  <NavLink
                    to="/oldtestamentjesus1"
                    className={({ isActive }) =>
                      "sub-nav-link" + (isActive ? " active" : "")
                    }
                  >
                    <span className="sub-nav-icon">✨</span>
                    <span className="sub-nav-text">Old Testament Jesus 1</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
          <li>
            <a href="/notes" className="nav-link">
              <span className="nav-icon">📝</span>
              <span className="nav-text">Notes</span>
            </a>
          </li>
          <li>
            <a href="/search" className="nav-link">
              <span className="nav-icon">🔍</span>
              <span className="nav-text">Search</span>
            </a>
          </li>
          <li>
            <a href="/favorites" className="nav-link">
              <span className="nav-icon">⭐</span>
              <span className="nav-text">Favorites</span>
            </a>
          </li>
          <li>
            <a href="/settings" className="nav-link">
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Settings</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
