import React from "react";
import "./Footer.css";
import { FaScroll } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <span>
            <FaScroll style={{ marginRight: "8px", verticalAlign: "middle" }} />
            Flare Bible Study. MIT Copyright © 2025.
          </span>
        </div>
        <div className="footer-right">
          <span>
            Web Sites by <b>Don Milligan.</b>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
