import React from 'react';
import './Sidebar.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Add this library
import { Link } from 'react-router-dom';

const Sidebar = ({ collapsed, onToggle }) => {
  return (
    <div className={`main-sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside id="sidebar-wrapper">

        {/* Collapse/Expand Toggle */}
        <div className="sidebar-toggle" onClick={onToggle}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </div>

        <div className="sidebar-brand">
          <Link to="/">
            <i className="mdi mdi-fire"></i>
            <span>Flare BIBLE STUDY</span>
          </Link>
        </div>

        <div className="sidebar-brand-sm">
          <a href="#">
            <i className="fas fa-fire fa-rotate-45"></i>
          </a>
        </div>

        <ul className="sidebar-menu">
          <li className="menu-header">Version 2.0 Demo</li>
        
          <li className="nav-item dropdown">
            <a href="/" className="nav-link has-dropdown">
              <i className="fas fa-scroll"></i> <span>Flare</span>
            </a>
          </li>
          <li className="menu-header">Version 1.0 Subject Maps</li>
          <li className="nav-item dropdown">
            <a href="oldtestamentsjesus2" className="nav-link has-dropdown">
              <i className="fas fa-cross"></i> <span>Jesus</span>
            </a>
          </li>
          <li className="nav-item dropdown">
            <a href="oldtestamentsjesus2" className="nav-link has-dropdown">
              <i className="fas fa-heart"></i> <span>Promises</span>
            </a>
          </li>
          <li className="nav-item dropdown active">
            <a href="#" className="nav-link has-dropdown">
              <i className="fas fa-clock"></i> <span>Prophecy</span>
            </a>
            <li className="nav-item">
            <Link to="/WorldEmpires" className="nav-link">
              <i className="fas fa-clock"></i> <span>World Empires</span>
            </Link>
          </li>
          </li>
          <li className="nav-item dropdown">
            <a href="#" className="nav-link has-dropdown">
              <i className="fas fa-leaf"></i> <span>Land of the Living</span>
            </a>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
