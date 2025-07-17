import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className={`layout ${collapsed ? 'sidebar-collapsed' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      {/* Left Sidebar */}
      <div className="layout-sidebar">
        <Sidebar collapsed={collapsed} />
      </div>
      
      {/* Right Main Content Area */}
      <div className="layout-main">
        {/* Top Navbar */}
        <div className="layout-navbar">
          <Navbar 
            toggleSidebar={toggleSidebar} 
            toggleMobileMenu={toggleMobileMenu}
            collapsed={collapsed} 
            mobileMenuOpen={mobileMenuOpen}
          />
        </div>
        
        {/* Main Content Area */}
        <div className="layout-content" onClick={closeMobileMenu}>
          {children}
        </div>
        
        {/* Bottom Footer */}
        <div className="layout-footer" onClick={closeMobileMenu}>
          <Footer />
        </div>
      </div>
      
      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}></div>
      )}
    </div>
  );
};

export default Layout; 