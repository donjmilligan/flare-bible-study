import React, { useState, useRef, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar navbar-expand-lg main-navbar" style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
      <div></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'}}>
        <h1 style={{ margin: 0, fontWeight: 700, fontSize:'2.5rem', display: 'flex', alignItems: 'center', color: '#2563eb' }}>
          fl<i className="fas fa-fire fa-rotate-45" style={{ margin: '0 6px' }}></i>re
        </h1>
        <div className="dropdown dropdown-list-toggle" style={{ marginLeft: '3px', position: 'relative'  }} ref={dropdownRef}>
          <button
            className="nav-link notification-toggle nav-link-lg"
            style={{ fontSize: '1.5rem', color: '#333', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setDropdownOpen((open) => !open)}
            aria-label="Settings"
          >
            <i className="fas fa-cog"></i>
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu dropdown-list dropdown-menu-right" style={{ display: 'block', position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)', minWidth: 260, zIndex: 1000, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 8, padding: 12 }}>
              <div className="dropdown-header" style={{ fontWeight: 600, borderBottom: '1px solid #eee', marginBottom: 8 }}>
                Settings
                <span style={{ float: 'right', cursor: 'pointer', color: '#2563eb' }} onClick={() => setDropdownOpen(false)}>close</span>
              </div>
              <div className="dropdown-list-content dropdown-list-icons">
                <a href="#" className="dropdown-item dropdown-item-unread" style={{ display: 'flex', alignItems: 'center', padding: 8, borderRadius: 4, textDecoration: 'none', color: '#333' }}>
                  <div className="dropdown-item-icon bg-primary text-white" style={{ marginRight: 10, background: '#2563eb', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-code"></i>
                  </div>
                  <div className="dropdown-item-desc">
                    The Flare app has a new layout this year 
                  </div>
                </a>
                <a h-ref="https://freelancedon.ca/portfolio#contact-form" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', padding: 8, borderRadius: 4, textDecoration: 'none', color: '#333' }}>
                  <div className="dropdown-item-icon bg-info text-white" style={{ marginRight: 10, background: '#2563eb', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="far fa-user"></i>
                  </div>
                  <div className="dropdown-item-desc">
                    <b>Interested</b> in doing some web ministry blogging, videos, or programming? 
                    <div className="time">Lets chat</div>
                  </div>
                </a>
              </div>
              <div className="dropdown-footer text-center"></div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 