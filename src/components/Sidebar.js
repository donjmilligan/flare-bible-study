import React from 'react';
import './Sidebar.css';

const Sidebar = ({ collapsed }) => {
  return (
    <div className="main-sidebar sidebar-style-2">
      <aside id="sidebar-wrapper">
        <div className="sidebar-brand">
          <a href="/">
            <i className="mdi mdi-fire"></i> Flare BIBLE STUDY
          </a>
        </div>
        <div className="sidebar-brand sidebar-brand-sm">
          <a href="/">
            <h1><i className="fas fa-fire fa-rotate-45"></i></h1>
          </a>
        </div>
        <ul className="sidebar-menu">
          <li className="menu-header">Version 2.0 Demo</li>
          <li className="nav-item dropdown">
            <a href="#" className="nav-link has-dropdown">
              <i className="fas fa-scroll"></i><span>Flare</span>
            </a>
            <ul className="dropdown-menu">
              <li><a className="nav-link" href="/">Flare</a></li>
              <li><a className="nav-link" href="https://Hispattern.com">HisPattern.com</a></li>
            </ul>
          </li>
          <li className="menu-header">Version 1.0 Subject Maps</li>
          <li className="nav-item dropdown">
            <a href="#" className="nav-link has-dropdown">
              <i className="fas fa-cross"></i> <span>Jesus</span>
            </a>
            <ul className="dropdown-menu">
              <li><a className="nav-link" href="/old-testament-jesus-1">Old Testament Jesus 1</a></li>
              <li><a className="nav-link" href="/old-testament-jesus-2">Old Testament Jesus 2</a></li>
            </ul>
          </li>
          <li className="nav-item dropdown">
            <a href="#" className="nav-link has-dropdown">
              <i className="fas fa-heart"></i> <span>Promises</span>
            </a>
            <ul className="dropdown-menu">
              <li><a className="nav-link" href="/messages-of-hope">Messages of Hope</a></li>
            </ul>
          </li>
          <li className="nav-item dropdown active">
            <a href="#" className="nav-link has-dropdown">
              <i className="fas fa-clock"></i> <span>Prophecy</span>
            </a>
            <ul className="dropdown-menu">
              <li><a className="nav-link active" href="/world-empires">Empires</a></li>
              <li><a className="nav-link disabled" href="/prophecy-keys">Keys (todo)</a></li>
            </ul>
          </li>
          <li className="nav-item dropdown">
            <a href="#" className="nav-link has-dropdown">
              <i className="fas fa-leaf"></i> <span>Land of the Living</span>
            </a>
            <ul className="dropdown-menu">
              <li><a className="nav-link" href="/what-is-spirit">What Is Spirit</a></li>
            </ul>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar; 