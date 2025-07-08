import React from 'react';
import './Navbar.css';

const Navbar = ({ onToggleSidebar }) => {
  return (
    <nav className="navbar navbar-expand-lg main-navbar">
      <form className="form-inline mr-auto">
        <ul className="navbar-nav mr-3">
          <li>
            <i 
              className="sidebar-toggle fas fa-chevron-left" 
              onClick={onToggleSidebar}
              style={{ cursor: 'pointer' }}
            > </i>
          </li>
        </ul>
      </form>
      <h1>fl<i className="fas fa-fire fa-rotate-45"></i>re</h1>
      <ul className="navbar-nav navbar-right">
        <li className="dropdown dropdown-list-toggle">
          <a href="#" data-toggle="dropdown" className="nav-link notification-toggle nav-link-lg">
            <i className="fas fa-cog"></i>
          </a>
          <div className="dropdown-menu dropdown-list dropdown-menu-right">
            <div className="dropdown-header">
              Settings
              <div className="float-right">
                <a href="#">close</a>
              </div>
            </div>
            <div className="dropdown-list-content dropdown-list-icons">
              <a href="#" className="dropdown-item dropdown-item-unread">
                <div className="dropdown-item-icon bg-primary text-white">
                  <i className="fas fa-code"></i>
                </div>
                <div className="dropdown-item-desc">
                  The Flare app has a new layout this year 
                </div>
              </a>
              <a href="https://freelancedon.ca/portfolio#contact-form" className="dropdown-item">
                <div className="dropdown-item-icon bg-info text-white">
                  <i className="far fa-user"></i>
                </div>
                <div className="dropdown-item-desc">
                  <b>Interested</b> in doing some web ministry bogging, videos, or programming? 
                  <div className="time">Lets chat</div>
                </div>
              </a>
            </div>
            <div className="dropdown-footer text-center">
            </div>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar; 