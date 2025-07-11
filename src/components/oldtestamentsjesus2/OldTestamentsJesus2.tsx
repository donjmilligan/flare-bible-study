import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import dataService from '../../services/dataService';
import './OldTestamentsJesus2.css';
import InfoPanel from '../WorldEmpires/InfoPanel.tsx';


const OldTestamentsJesus2 = ({ textSize, circleSize, onNodeClick }) => {
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
  // State for inline editing
  const [inlineEdit, setInlineEdit] = useState({ node: null, value: '', x: 0, y: 0 });

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
        // Fetch from the new API endpoint
        const response = await fetch('http://localhost:3000/api/oldtestamentsjesus2');
        let data = await response.json();
        // Add root node if missing
        if (!data.some(node => node.name === "")) {
          data.unshift({ id: 0, name: "", imports: [] });
        }
        // Ensure size is a number for all nodes
        const fixedData = data.map(node => ({
          ...node,
          size: (typeof node.size === 'number' && !isNaN(node.size)) ? node.size : 1
        }));
        setSource(fixedData);
        plotHierarchicalEdgeBundling(fixedData);
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

  // Add node (API)
  const addNewNode = async () => {
    if (newNodeData.name) {
      try {
        const response = await fetch('http://localhost:3000/oldtestamentsjesus2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newNodeData.name,
            size: 1,
            imports: newNodeData.imports
          })
        });
        if (!response.ok) throw new Error('Failed to add node');
        const createdNode = await response.json();
        const newSource = [...source, createdNode];
        setSource(newSource);
        setShowAddNodeForm(false);
        setNewNodeData({ name: '', imports: [] });
        plotHierarchicalEdgeBundling(newSource);
        setSaveStatus('Node added!');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        setSaveStatus('Add failed: ' + error.message);
        setTimeout(() => setSaveStatus(''), 3000);
      }
    }
  };

  // Edit node (API)
  const saveNodeEdit = async () => {
    if (editingNode && newNodeData.name) {
      try {
        const response = await fetch(`http://localhost:3000/empires-nodes/${encodeURIComponent(editingNode.name)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newName: newNodeData.name,
            size: editingNode.size || 1,
            imports: newNodeData.imports
          })
        });
        if (!response.ok) throw new Error('Failed to update node');
        const updatedNode = await response.json();
        const updatedSource = source.map(node =>
          node.name === editingNode.name ? updatedNode : node
        );
        setSource(updatedSource);
        setEditingNode(null);
        setNewNodeData({ name: '', imports: [] });
        plotHierarchicalEdgeBundling(updatedSource);
        setSaveStatus('Node updated!');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        setSaveStatus('Update failed: ' + error.message);
        setTimeout(() => setSaveStatus(''), 3000);
      }
    }
  };

  // Delete node (API)
  const deleteNode = async (nodeName) => {
    if (window.confirm(`Are you sure you want to delete "${nodeName}"?`)) {
      try {
        const response = await fetch(`http://localhost:3000/empires-nodes/${encodeURIComponent(nodeName)}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete node');
        const updatedSource = source.filter(node => node.name !== nodeName);
        setSource(updatedSource);
        setSelectedNode(null);
        plotHierarchicalEdgeBundling(updatedSource);
        setSaveStatus('Node deleted!');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        setSaveStatus('Delete failed: ' + error.message);
        setTimeout(() => setSaveStatus(''), 3000);
      }
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

  // Helper to handle inline rename submit
  const handleInlineRename = async (e) => {
    e.preventDefault();
    if (!inlineEdit.node) return;
    try {
      const response = await fetch(`http://localhost:3000/empires-nodes/${encodeURIComponent(inlineEdit.node.name)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newName: inlineEdit.value,
          size: inlineEdit.node.size || 1,
          imports: inlineEdit.node.imports || []
        })
      });
      if (!response.ok) throw new Error('Failed to update node');
      const updatedNode = await response.json();
      const updatedSource = source.map(node =>
        node.name === inlineEdit.node.name ? updatedNode : node
      );
      setSource(updatedSource);
      plotHierarchicalEdgeBundling(updatedSource);
      setInlineEdit({ node: null, value: '', x: 0, y: 0 });
      setSaveStatus('Node renamed!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      setSaveStatus('Rename failed: ' + error.message);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Helper to update node position in backend
  const updateNodePosition = async (node, newX, newY) => {
    try {
      const response = await fetch(`http://localhost:3000/empires-nodes/${encodeURIComponent(node.name)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newName: node.name,
          size: node.size || 1,
          imports: node.imports || [],
          x: newX,
          y: newY
        })
      });
      if (!response.ok) throw new Error('Failed to update node position');
      setSaveStatus('Node position updated!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      setSaveStatus('Position update failed: ' + error.message);
      setTimeout(() => setSaveStatus(''), 3000);
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
        // Use d.x and d.y if present, else fallback to radial
        if (typeof d.x_drag === 'number' && typeof d.y_drag === 'number') {
          return `translate(${d.x_drag},${d.y_drag})`;
        }
        return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)");
      })
      .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .text(function(d) { return d.key; })
      .on("mouseover", mouseovered)
      .on("mouseout", mouseouted)
      .on("click", clicked)
      .style("cursor", isEditMode ? "pointer" : "default")
      .on("dblclick", function(event, d) {
        // Get SVG position and convert to screen coordinates
        const svg = document.querySelector('#' + chartElementId + ' svg') as SVGSVGElement | null;
        if (!svg) return;
        const pt = svg.createSVGPoint();
        const matrix = svg.getScreenCTM();
        if (!matrix) return;
        // Get the node's transform
        const transform = d3.select(this).attr('transform');
        // Parse the translate from the transform string
        let x = 0, y = 0;
        const match = /translate\(([^,]+),([^\)]+)\)/.exec(transform);
        if (match) {
          x = parseFloat(match[1]);
          y = parseFloat(match[2]);
        }
        pt.x = x;
        pt.y = y;
        const screenPos = pt.matrixTransform(matrix);
        setInlineEdit({ node: d, value: d.key, x: screenPos.x, y: screenPos.y });
      })
      .call(
        d3.behavior.drag()
          .on('drag', function(d) {
            // Update position in data
            d.x_drag = d3.event.x;
            d.y_drag = d3.event.y;
            d3.select(this).attr('transform', `translate(${d.x_drag},${d.y_drag})`);
            // Optionally, update links here for live feedback
          })
          .on('dragend', function(d) {
            // Save new position to backend
            updateNodePosition(d, d.x_drag, d.y_drag);
            // Optionally, re-render links here
          })
      );

    // Set height for the container
    d3.select("#" + chartElementId).style("height", diameter + "px");

    // Helper functions
    function packageHierarchy(classes) {
      const map: any = {};

      // Always create the root node first
      map[""] = { name: "", children: [] };

      function find(name, data) {
        let node = map[name], i;
        if (!node) {
          node = map[name] = data || { name: name, children: [] };
          if (name.length) {
            const parentName = name.substring(0, i = name.lastIndexOf("."));
            node.parent = find(parentName, undefined);
            if (node.parent && node.parent.children) {
              node.parent.children.push(node);
            }
            node.key = name.substring(i + 1);
          }
        }
        return node;
      }

      classes.forEach(function (d) {
        find(d.name, d);
      });

      return map[""];
    }

    function packageImports(nodes) {
      const map: any = {},
            imports: any[] = [];
      
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
    <div className="row world-empires-row" style={{ position: 'relative' }}>
      {/* Inline edit input overlay */}
      {inlineEdit.node && (
        <form
          onSubmit={handleInlineRename}
          style={{
            position: 'fixed',
            left: inlineEdit.x,
            top: inlineEdit.y,
            zIndex: 2000,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <input
            type="text"
            value={inlineEdit.value}
            autoFocus
            onChange={e => setInlineEdit({ ...inlineEdit, value: e.target.value })}
            onBlur={() => setInlineEdit({ node: null, value: '', x: 0, y: 0 })}
            style={{ fontSize: 16, width: 120 }}
          />
        </form>
      )}
      <div className="col-12 col-lg-9 position-relative">
        {/* Visualization */}
        <div
          id="chtHierarchicalEdgeBundling"
          className="heb"
          style={{ position: 'relative', minHeight: 300 }}
        >
          <div
            className="edit-controls-float"
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              background: 'none',
              boxShadow: 'none',
              borderRadius: '50%',
            }}
          >
            {!isEditMode && (
              <button
                className="btn"
                onClick={toggleEditMode}
                title="Add Node"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  backgroundColor: '#28a745', // Bootstrap green
                  color: 'white',
                  border: 'none',
                }}
              >
                <i className="mdi mdi-plus" style={{ color: 'white' }}></i>
              </button>
            )}
            {isEditMode && (
              <button
                className="btn btn-danger"
                onClick={toggleEditMode}
                title="Exit Edit Mode"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}
              >
                <i className="mdi mdi-close"></i>
              </button>
            )}
          </div>
          {/* D3 will render here */}
          {/* Floating Edit Controls */}
        </div>
        {/* Save Status */}
        {saveStatus && (
          <div className="save-status mt-2 text-end">
            {saveStatus}
          </div>
        )}
        {/* Add Node Form */}
        {showAddNodeForm && (
          <div className="add-node-form mt-2">
            <h4>Add New Node</h4>
            <input
              type="text"
              placeholder="Node name (e.g., flare.empires.new.NewEmpire)"
              value={newNodeData.name}
              onChange={(e) => setNewNodeData({...newNodeData, name: e.target.value})}
            />
            <label>Imports (select one or more):</label>
            <select
              multiple
              value={newNodeData.imports}
              onChange={e => {
                const options = Array.from(e.target.selectedOptions, option => (option as HTMLOptionElement).value);
                setNewNodeData({...newNodeData, imports: options});
              }}
              style={{ width: '100%', minHeight: 80 }}
            >
              {source && source.map(node => (
                <option key={node.name} value={node.name}>{node.name}</option>
              ))}
            </select>
            <div className="form-buttons mt-2">
              <button className="btn btn-success btn-sm" onClick={addNewNode}>Add Node</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddNodeForm(false)}>Cancel</button>
            </div>
          </div>
        )}
        {/* Edit Node Form */}
        {editingNode && (
          <div className="edit-node-form mt-2">
            <h4>Edit Node: {editingNode.name}</h4>
            <input
              type="text"
              placeholder="Node name"
              value={newNodeData.name}
              onChange={(e) => setNewNodeData({...newNodeData, name: e.target.value})}
            />
            <label>Imports (select one or more):</label>
            <select
              multiple
              value={newNodeData.imports}
              onChange={e => {
                const options = Array.from(e.target.selectedOptions, option => (option as HTMLOptionElement).value);
                setNewNodeData({...newNodeData, imports: options});
              }}
              style={{ width: '100%', minHeight: 80 }}
            >
              {source && source.map(node => (
                <option key={node.name} value={node.name}>{node.name}</option>
              ))}
            </select>
            <div className="form-buttons mt-2">
              <button className="btn btn-success btn-sm" onClick={saveNodeEdit}>Save Changes</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingNode(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      <div className="col-12 col-lg-3 mobile">
        <InfoPanel />
      </div>
    </div>
  );
};

export default OldTestamentsJesus2; 