import React, { useState } from 'react';
import './Navbar.css';

const Navbar = ({ toggleSidebar, toggleMobileMenu, collapsed, mobileMenuOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const toggleSettings = (e) => {
    e.stopPropagation();
    setSettingsOpen(!settingsOpen);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <button 
          className="sidebar-toggle" 
          onClick={toggleSidebar}
          title="Toggle Sidebar"
        >
          ☰
        </button>
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          title="Mobile Menu"
        >
          ☰
        </button>
        <div className="search-container">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search Bible verses, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </form>
        </div>
      </div>
      
      <div className="navbar-right">
        <div className="navbar-item">
          <h2 className="flare-brand">fl🔥re</h2>
          <div className="dropdown">
            <button 
              className="settings-toggle"
              onClick={toggleSettings}
              title="Settings"
            >
              ⚙️
            </button>
            {settingsOpen && (
              <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                <div className="dropdown-header">
                  Settings
                  <button 
                    className="close-btn"
                    onClick={closeSettings}
                  >
                    ✕
                  </button>
                </div>
                <div className="dropdown-content">
                  <a href="#" className="dropdown-item">
                    <div className="dropdown-item-icon bg-primary">
                      <span>💻</span>
                    </div>
                    <div className="dropdown-item-desc">
                      The Flare app has a new layout this year
                    </div>
                  </a>
                  <a href="https://freelancedon.ca/portfolio#contact-form" className="dropdown-item">
                    <div className="dropdown-item-icon bg-info">
                      <span>👤</span>
                    </div>
                    <div className="dropdown-item-desc">
                      <b>Interested</b> in doing some web ministry blogging, videos, or programming?
                      <div className="time">Lets chat</div>
                    </div>
                  </a>
                </div>
                <div className="dropdown-footer">
                  <h1>fl🔥re</h1>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar; 