import React, { useState } from "react";
import Sidebar from "../Layout/Sidebar";
import Navbar from "../Layout/Navbar";
import "./Dashboard.css";

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      {/* Stats Grid */}
      <div className="stats-grid"></div>

      {/* Recent Activity */}
    </div>
  );
};

export default Dashboard;
