import React from "react";
import Layout from "./components/Layout/Layout";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import OldTestamentJesus1 from "./pages/OldTestamentJesus1";
import OldTestamentJesus2 from "./components/oldtestamentjesus2/OldTestamentJesus2";

function DashboardContent() {
  return (
    <div className="dashboard-content">
      <h1>Welcome to Flare Bible Study</h1>
      <p>Your personal Bible study companion</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Bible Studies</h3>
          <div className="stat-value">24</div>
          <div className="stat-description">This month</div>
        </div>

        <div className="stat-card">
          <h3>Notes Created</h3>
          <div className="stat-value">156</div>
          <div className="stat-description">Total notes</div>
        </div>

        <div className="stat-card">
          <h3>Study Time</h3>
          <div className="stat-value">42h</div>
          <div className="stat-description">This week</div>
        </div>

        <div className="stat-card">
          <h3>Favorites</h3>
          <div className="stat-value">18</div>
          <div className="stat-description">Saved verses</div>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Bible Studies</h3>
          <div className="stat-value">24</div>
          <div className="stat-description">This month</div>
        </div>

        <div className="stat-card">
          <h3>Notes Created</h3>
          <div className="stat-value">156</div>
          <div className="stat-description">Total notes</div>
        </div>

        <div className="stat-card">
          <h3>Study Time</h3>
          <div className="stat-value">42h</div>
          <div className="stat-description">This week</div>
        </div>

        <div className="stat-card">
          <h3>Favorites</h3>
          <div className="stat-value">18</div>
          <div className="stat-description">Saved verses</div>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Bible Studies</h3>
          <div className="stat-value">24</div>
          <div className="stat-description">This month</div>
        </div>

        <div className="stat-card">
          <h3>Notes Created</h3>
          <div className="stat-value">156</div>
          <div className="stat-description">Total notes</div>
        </div>

        <div className="stat-card">
          <h3>Study Time</h3>
          <div className="stat-value">42h</div>
          <div className="stat-description">This week</div>
        </div>

        <div className="stat-card">
          <h3>Favorites</h3>
          <div className="stat-value">18</div>
          <div className="stat-description">Saved verses</div>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Bible Studies</h3>
          <div className="stat-value">24</div>
          <div className="stat-description">This month</div>
        </div>

        <div className="stat-card">
          <h3>Notes Created</h3>
          <div className="stat-value">156</div>
          <div className="stat-description">Total notes</div>
        </div>

        <div className="stat-card">
          <h3>Study Time</h3>
          <div className="stat-value">42h</div>
          <div className="stat-description">This week</div>
        </div>

        <div className="stat-card">
          <h3>Favorites</h3>
          <div className="stat-value">18</div>
          <div className="stat-description">Saved verses</div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardContent />} />
          <Route path="/oldtestamentjesus1" element={<OldTestamentJesus1 />} />
          <Route path="/oldtestamentjesus2" element={<OldTestamentJesus2 />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
