import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import WorldEmpiresVisualization from './components/WorldEmpiresVisualization';
import InfoPanel from './components/InfoPanel';
import Footer from './components/Footer';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [textSize, setTextSize] = useState(8);
  const [circleSize, setCircleSize] = useState(1);

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

  return (
    <div id="app">
      <div className={`main-wrapper main-wrapper-1 ${sidebarCollapsed ? 'sidebar-mini' : ''}`}>
        <div className="navbar-bg"></div>
        
        <Navbar onToggleSidebar={toggleSidebar} />
        
        <Sidebar collapsed={sidebarCollapsed} />
        
        {/* Main Content */}
        <div className="main-content">
          <section className="section">
            <div className="section-body">
              <div className="row">
                <div className="col-12 col-lg-9">
                  {/* BIBLE STUDY */}
                  <WorldEmpiresVisualization 
                    textSize={textSize}
                    circleSize={circleSize}
                    onNodeClick={handleNodeClick}
                  />
                  {/* // BIBLE STUDY */}
                </div>

                <div className="col-12 col-lg-3 mobile">
                  <InfoPanel 
                    selectedNode={selectedNode}
                    textSize={textSize}
                    circleSize={circleSize}
                    onTextSizeChange={handleTextSizeChange}
                    onCircleSizeChange={handleCircleSizeChange}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}

export default App; 