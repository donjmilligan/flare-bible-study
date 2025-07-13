import React, { useState } from "react";
import Sidebar from "../Layout/Sidebar";
import Navbar from "../Layout/Navbar";
import "./Dashboard.css";

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-container">
      <Sidebar collapsed={collapsed} />
      <div className="main-content">
        <Navbar toggleSidebar={() => setCollapsed(!collapsed)} />
        <div className="page-content">
          <h2>Dashboard</h2>
          
          {/* Stats Grid */}
          <div className="stats-grid">
            
          </div>

          {/* Recent Activity */}
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
