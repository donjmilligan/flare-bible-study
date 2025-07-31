import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <span>© 2024 Flare Bible Study. All rights reserved.</span>
        </div>
        <div className="footer-right">
          <a href="/privacy" className="footer-link">Privacy</a>
          <a href="/terms" className="footer-link">Terms</a>
          <a href="/help" className="footer-link">Help</a>
        </div>
      </div>
    </div>
  );
};

export default Footer; 