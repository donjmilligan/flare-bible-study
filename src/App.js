import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar.tsx';
import Sidebar from './components/Sidebar.tsx';
import WorldEmpiresVisualization from './components/WorldEmpires/WorldEmpiresVisualization';
import Footer from './components/Footer.tsx';
import Signup from './components/auth/SignUp.tsx';
import Signin from './components/auth/Signin.tsx';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [textSize, setTextSize] = useState(8);
  const [circleSize, setCircleSize] = useState(1);
  const location = useLocation();

  useEffect(() => {
    // Auto-collapse sidebar on larger screens
    if (window.innerWidth > 1024) {
      setTimeout(() => {
        setSidebarCollapsed(true);
      }, 10);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleTextSizeChange = (newSize) => {
    setTextSize(newSize);
  };

  const handleCircleSizeChange = (newSize) => {
    setCircleSize(newSize);
  };

  // Hide sidebar and navbar on signup and signin pages
  const hideNav = location.pathname === '/' || location.pathname === '/registration' || location.pathname === '/signin';

  return (
    <div id="app">
      <div className={`main-wrapper main-wrapper-1 ${sidebarCollapsed ? 'sidebar-mini' : ''}`}>
        {!hideNav && <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />}
        {!hideNav && <Navbar />}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Signup />} />
            <Route path="/WorldEmpires" element={<WorldEmpiresVisualization 
              textSize={textSize}
              circleSize={circleSize}
              onNodeClick={handleNodeClick}
            />} />
            <Route path="/registration" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
          </Routes>
        </div>
        {!hideNav && <Footer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App; 