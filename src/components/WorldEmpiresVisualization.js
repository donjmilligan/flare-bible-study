import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import dataService from '../services/dataService';
import './WorldEmpiresVisualization.css';

const WorldEmpiresVisualization = ({ textSize, circleSize, onNodeClick }) => {
  const svgRef = useRef();
  const [currentSize, setCurrentSize] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [plot, setPlot] = useState(null);
  const [source, setSource] = useState(null);
  const [timer, setTimer] = useState(null);
  
  // Editing state
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [showAddNodeForm, setShowAddNodeForm] = useState(false);
  const [newNodeData, setNewNodeData] = useState({ name: '', imports: [] });
  const [diagramId, setDiagramId] = useState('world-empires-v1');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Initialize size on component mount
  useEffect(() => {
    if (currentSize === null) {
      let diam = 10;
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      if ((windowHeight < windowWidth) && (windowHeight >= 600)) {
        diam += windowHeight - 100;
      } else if ((windowHeight < windowWidth) && (windowHeight < 600)) {
        diam += 560;
      } else if ((windowWidth < windowHeight) && (windowWidth >= 600)) {
        diam += windowWidth - 100;
      } else {
        diam += 560;
      }
      
      setCurrentSize(diam);
      setOriginalSize(diam);
    }
  }, [currentSize]);

  // Update visualization when props change
  useEffect(() => {
    if (currentSize && source) {
      plotHierarchicalEdgeBundling(source);
    }
  }, [textSize, circleSize, currentSize, source]);

  // Load data and initialize visualization
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/studies/flare-EmpiresInProphecy.json');
        const data = await response.json();
        setSource(data);
        plotHierarchicalEdgeBundling(data);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (currentSize) {
      loadData();
    }
  }, [currentSize]);

  const plotHierarchicalEdgeBundling = (sourceFile) => {
    setSource(sourceFile);
    
    if (plot === null) {
      setTimer(true);
      const newPlot = setTimeout(() => {
        try {
          d3.select('.heb').style('font-size', `${textSize}em`);
          HierarchicalEdgeBundling("chtHierarchicalEdgeBundling", "infoHierarchicalEdgeBundling", sourceFile);
          d3.select('.heb svg').style('width', currentSize);
          d3.select('.heb svg').style('height', currentSize);
        } catch (error) {
          console.error('Error in HierarchicalEdgeBundling:', error);
        }
      }, 300);
      setPlot(newPlot);
      setTimeout(() => setTimer(null), 200);
    } else {
      d3.select("g").remove();
      d3.select("svg.bibleStudy").remove();
      const newPlot = setTimeout(() => {
        try {
          HierarchicalEdgeBundling("chtHierarchicalEdgeBundling", "infoHierarchicalEdgeBundling", sourceFile);
          d3.select('.heb svg').style('width', currentSize + 100);
          d3.select('.heb svg').style('height', currentSize + 100);
        } catch (error) {
          console.error('Error in HierarchicalEdgeBundling:', error);
        }
      }, 300);
      setPlot(newPlot);
      setTimeout(() => setTimer(null), 400);
    }
  };

  // Editing functions
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      setSelectedNode(null);
      setEditingNode(null);
    }
  };

  const handleNodeEdit = (node) => {
    if (isEditMode) {
      setEditingNode(node);
      setNewNodeData({ name: node.name, imports: node.imports || [] });
    } else {
      if (onNodeClick) {
        onNodeClick(node);
      }
    }
  };

  const saveNodeEdit = () => {
    if (editingNode && newNodeData.name) {
      const updatedSource = source.map(node => 
        node.name === editingNode.name 
          ? { ...node, name: newNodeData.name, imports: newNodeData.imports }
          : node
      );
      setSource(updatedSource);
      setEditingNode(null);
      setNewNodeData({ name: '', imports: [] });
      plotHierarchicalEdgeBundling(updatedSource);
      // Auto-save after editing
      saveDiagram(updatedSource);
    }
  };

  const addNewNode = () => {
    if (newNodeData.name) {
      const newSource = [...source, { name: newNodeData.name, imports: newNodeData.imports }];
      setSource(newSource);
      setShowAddNodeForm(false);
      setNewNodeData({ name: '', imports: [] });
      plotHierarchicalEdgeBundling(newSource);
      // Auto-save after adding
      saveDiagram(newSource);
    }
  };

  const deleteNode = (nodeName) => {
    if (window.confirm(`Are you sure you want to delete "${nodeName}"?`)) {
      const updatedSource = source.filter(node => node.name !== nodeName);
      setSource(updatedSource);
      setSelectedNode(null);
      plotHierarchicalEdgeBundling(updatedSource);
      // Auto-save after deletion
      saveDiagram(updatedSource);
    }
  };

  // Save diagram data
  const saveDiagram = async (dataToSave = source) => {
    if (!dataToSave) return;
    
    setIsSaving(true);
    setSaveStatus('Saving...');
    
    try {
      // Try to save to backend first
      await dataService.saveDiagram(diagramId, dataToSave, 'current-user');
      setSaveStatus('Saved successfully!');
      
      // Also save to localStorage as backup
      dataService.saveToLocalStorage(diagramId, dataToSave);
      
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Failed to save to backend, using localStorage:', error);
      // Fallback to localStorage
      const saved = dataService.saveToLocalStorage(diagramId, dataToSave);
      setSaveStatus(saved ? 'Saved locally' : 'Save failed');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Export diagram
  const exportDiagram = () => {
    if (source) {
      dataService.exportDiagram(source, `world-empires-${Date.now()}.json`);
    }
  };

  // Import diagram
  const importDiagram = (event) => {
    const file = event.target.files[0];
    if (file) {
      dataService.importDiagram(file)
        .then(data => {
          setSource(data);
          plotHierarchicalEdgeBundling(data);
          setSaveStatus('Diagram imported successfully!');
          setTimeout(() => setSaveStatus(''), 2000);
        })
        .catch(error => {
          setSaveStatus('Import failed: ' + error.message);
          setTimeout(() => setSaveStatus(''), 3000);
        });
    }
  };

  // HierarchicalEdgeBundling class (converted from original JavaScript)
  const HierarchicalEdgeBundling = (chartElementId, infoElementId, classes) => {
    const diameter = currentSize;
    const radius = diameter / 2;
    const innerRadius = radius - 120;

    // Create circle cluster
    const cluster = d3.layout.cluster()
      .size([360, innerRadius])
      .sort(null)
      .value(function(d) { return d.size; });

    const bundle = d3.layout.bundle();

    const line = d3.svg.line.radial()
      .interpolate("bundle")
      .tension(.9)
      .radius(function(d) { return d.y; })
      .angle(function(d) { return d.x / 180 * Math.PI; });

    // Clear the container before rendering to prevent duplicate diagrams
    d3.select("#" + chartElementId).selectAll("*").remove();

    // Create SVG element
    const svg = d3.select("#" + chartElementId).append("svg")
      .attr("class", "bibleStudy")
      .attr("id", "g4")
      .append("g")
      .attr("transform", "translate(" + radius + "," + radius + ")");

    // Link node "birth place"
    let link = svg.append("g").selectAll(".link"),
        node = svg.append("g").selectAll(".node");

    // Classes is each "object" from the json
    const nodes = cluster.nodes(packageHierarchy(classes)),
          links = packageImports(nodes);

    link = link
      .data(bundle(links))
      .enter().append("path")
      .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
      .attr("class", "link")
      .attr("d", line);

    // Node object
    node = node
      .data(nodes.filter(function(n) { return !n.children; }))
      .enter().append("text")
      .attr("class", "node")
      .attr("dy", ".31em")
      .attr("transform", function(d) { 
        return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); 
      })
      .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .text(function(d) { return d.key; })
      .on("mouseover", mouseovered)
      .on("mouseout", mouseouted)
      .on("click", clicked)
      .style("cursor", isEditMode ? "pointer" : "default");

    // Set height for the container
    d3.select("#" + chartElementId).style("height", diameter + "px");

    // Helper functions
    function packageHierarchy(classes) {
      const map = {};
      
      function find(name, data) {
        let node = map[name], i;
        if (!node) {
          node = map[name] = data || {name: name, children: []};
          if (name.length) {
            node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
            node.parent.children.push(node);
            node.key = name.substring(i + 1);
          }
        }
        return node;
      }
      
      classes.forEach(function(d) {
        find(d.name, d);
      });
      
      return map[""];
    }

    function packageImports(nodes) {
      const map = {},
            imports = [];
      
      // Compute a map from name to node.
      nodes.forEach(function(d) {
        map[d.name] = d;
      });
      
      // For each import, construct a link from the source to target node.
      nodes.forEach(function(d) {
        if (d.imports) d.imports.forEach(function(i) {
          imports.push({source: map[d.name], target: map[i]});
        });
      });
      
      return imports;
    }

    function mouseovered(d) {
      node
        .each(function(n) { n.target = n.source = false; });
      
      link
        .classed("link--source", function(l) { if (l.target === d) return l.source.source = true; })
        .classed("link--target", function(l) { if (l.source === d) return l.target.target = true; })
        .filter(function(l) { return l.target === d || l.source === d; })
        .each(function() { this.parentNode.appendChild(this); });
      
      node
        .classed("node--source", function(n) { return n.source; })
        .classed("node--target", function(n) { return n.target; });
    }

    function mouseouted(d) {
      link
        .classed("link--source", false)
        .classed("link--target", false);
      
      node
        .classed("node--source", false)
        .classed("node--target", false);
    }

    function clicked(d) {
      handleNodeEdit(d);
    }

    function showTexts(d) {
      // This would be implemented to show related Bible texts
      // For now, we'll just log the clicked node
      console.log('Clicked node:', d);
    }
  };

  return (
    <div className="visualization-container">
      {/* Edit Controls */}
      <div className="edit-controls">
        <button 
          className={`btn ${isEditMode ? 'btn-danger' : 'btn-primary'}`}
          onClick={toggleEditMode}
        >
          {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        </button>
        
        {isEditMode && (
          <>
            <button 
              className="btn btn-success"
              onClick={() => setShowAddNodeForm(true)}
            >
              Add New Node
            </button>
            
            {selectedNode && (
              <button 
                className="btn btn-warning"
                onClick={() => deleteNode(selectedNode.name)}
              >
                Delete Selected
              </button>
            )}
          </>
        )}

        {/* Save/Export Controls */}
        <div className="save-controls">
          <button 
            className="btn btn-info"
            onClick={() => saveDiagram()}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={exportDiagram}
          >
            Export
          </button>
          
          <label className="btn btn-outline-secondary">
            Import
            <input
              type="file"
              accept=".json"
              onChange={importDiagram}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div className="save-status">
            {saveStatus}
          </div>
        )}
      </div>

      {/* Add Node Form */}
      {showAddNodeForm && (
        <div className="add-node-form">
          <h4>Add New Node</h4>
          <input
            type="text"
            placeholder="Node name (e.g., flare.empires.new.NewEmpire)"
            value={newNodeData.name}
            onChange={(e) => setNewNodeData({...newNodeData, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Imports (comma-separated)"
            value={newNodeData.imports.join(', ')}
            onChange={(e) => setNewNodeData({
              ...newNodeData, 
              imports: e.target.value.split(',').map(s => s.trim()).filter(s => s)
            })}
          />
          <div className="form-buttons">
            <button className="btn btn-success" onClick={addNewNode}>Add Node</button>
            <button className="btn btn-secondary" onClick={() => setShowAddNodeForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Edit Node Form */}
      {editingNode && (
        <div className="edit-node-form">
          <h4>Edit Node: {editingNode.name}</h4>
          <input
            type="text"
            placeholder="Node name"
            value={newNodeData.name}
            onChange={(e) => setNewNodeData({...newNodeData, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Imports (comma-separated)"
            value={newNodeData.imports.join(', ')}
            onChange={(e) => setNewNodeData({
              ...newNodeData, 
              imports: e.target.value.split(',').map(s => s.trim()).filter(s => s)
            })}
          />
          <div className="form-buttons">
            <button className="btn btn-success" onClick={saveNodeEdit}>Save Changes</button>
            <button className="btn btn-secondary" onClick={() => setEditingNode(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Visualization */}
      <div id="chtHierarchicalEdgeBundling" className="heb">
        {/* D3.js will render the visualization here */}
      </div>
    </div>
  );
};

export default WorldEmpiresVisualization; 