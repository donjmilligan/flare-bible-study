import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { FaPlus } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";

const API_URL = "http://localhost:3001/api/bible/oldtestamentjesus1";
const WIDTH = 600;
const HEIGHT = 600;
const MARGIN = 120;
const FONT_SIZE = 12;
const FONT_FAMILY = "Times New Roman, Times, serif";

export default function OldTestamentJesus1Full() {
  const svgRef = useRef();
  const zoomRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fontSize, setFontSize] = useState(FONT_SIZE);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNodeName, setNewNodeName] = useState("");
  const [newNodeImports, setNewNodeImports] = useState([]);
  const [allNodeNames, setAllNodeNames] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingNode, setDeletingNode] = useState(null);
  const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity);

  // Fetch data from API
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((d) => {
        console.log("Loaded data:", d);
        // Support both array and {data: [...]} formats
        const processed = Array.isArray(d) ? d : d.data;
        console.log("Processed data for D3:", processed);
        setData(processed);
        setLoading(false);
      });
  }, []);

  // Fetch all node names for dropdown when modal opens
  useEffect(() => {
    if (showAddModal) {
      fetch(API_URL)
        .then((res) => res.json())
        .then((d) => {
          const processed = Array.isArray(d) ? d : d.data;
          setAllNodeNames(processed.map((n) => n.name));
        });
    }
  }, [showAddModal]);

  // D3 rendering logic
  useEffect(() => {
    if (!data.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // --- Data Preparation ---
    // Classic flare hierarchy builder
    function packageHierarchy(classes) {
      const map = {};
      function find(name, data) {
        let node = map[name],
          i;
        if (!node) {
          node = map[name] = data || { name: name, children: [] };
          if (name.length) {
            node.parent = find(name.substring(0, (i = name.lastIndexOf("."))));
            node.parent.children.push(node);
            node.key = name.substring(i + 1);
          }
        }
        return node;
      }
      classes.forEach((d) => find(d.name, d));
      return map[""];
    }

    const RADIUS = Math.min(WIDTH, HEIGHT) / 2 - MARGIN;
    const cluster = d3.cluster().size([360, RADIUS]);
    const root = d3.hierarchy(packageHierarchy(data));
    cluster(root);
    const nodes = root.leaves();
    // Set saved positions if available
    nodes.forEach((n) => {
      if (
        typeof n.data.angle === "number" &&
        typeof n.data.radius === "number"
      ) {
        n.x = n.data.angle;
        n.y = n.data.radius;
      }
    });
    // Build a map from name to D3 hierarchy node
    const nodeMap = {};
    nodes.forEach((n) => {
      nodeMap[n.data.name] = n;
    });
    // Build links using hierarchy nodes
    const links = [];
    nodes.forEach((n) => {
      if (n.data.imports) {
        n.data.imports.forEach((i) => {
          if (nodeMap[i]) links.push({ source: n, target: nodeMap[i] });
        });
      }
    });
    console.log("Hierarchy:", root);
    console.log(
      "Nodes:",
      nodes.map((n) => n.data.name),
    );
    console.log("Links:", links);
    if (links.length === 0) alert("No links created!");

    // --- Draw links (edges) ---
    const line = d3
      .lineRadial()
      .curve(d3.curveBundle.beta(0.85))
      .radius((d) => d.y)
      .angle((d) => (d.x / 180) * Math.PI);

    const linkGroup = svg.append("g").attr("class", "links");
    const nodeGroup = svg.append("g").attr("class", "nodes");

    function linkPath(link) {
      return line(
        link.source
          .path(root)
          .reverse()
          .concat(link.target.path(root).slice(1)),
      );
    }

    const linkElems = linkGroup
      .selectAll("path.link")
      .data(links)
      .join("path")
      .attr("class", "link")
      .attr("d", linkPath)
      .attr("fill", "none")
      .attr("stroke", "#7db7e8")
      .attr("stroke-width", 1)
      .attr("opacity", 0.15); // faint by default

    const nodeElems = nodeGroup
      .selectAll("text.node")
      .data(nodes)
      .join("text")
      .attr("class", "node")
      .attr("dy", ".31em")
      .attr(
        "transform",
        (d) =>
          `rotate(${d.x - 90})translate(${Math.max(0, d.y - 20)},0)${d.x < 180 ? "" : "rotate(180)"}`,
      )
      .style("text-anchor", (d) => (d.x < 180 ? "start" : "end"))
      .text((d) => d.data.key || d.data.label || d.data.name)
      .attr("font-size", fontSize)
      .attr("fill", "#2d3a4a")
      .style("font-family", FONT_FAMILY)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        setSelectedNode(d.data);
        event.stopPropagation();
      });

    // --- Interactivity: highlight links/nodes on hover ---
    nodeElems
      .on("mouseover", function (event, d) {
        nodeElems
          .classed("node--source", false)
          .classed("node--target", false)
          .classed("node--active", false);
        linkElems
          .attr("stroke", (l) =>
            l.source === d || l.target === d ? "#e74c3c" : "#7db7e8",
          )
          .attr("stroke-width", (l) =>
            l.source === d || l.target === d ? 3 : 1,
          )
          .attr("opacity", (l) =>
            l.source === d || l.target === d ? 1 : 0.08,
          );
        nodeElems.each(function (n) {
          if (links.some((l) => l.source === d && l.target === n)) {
            d3.select(this).classed("node--target", true);
          }
          if (links.some((l) => l.target === d && l.source === n)) {
            d3.select(this).classed("node--source", true);
          }
        });
        d3.select(this).classed("node--active", true);
        // Do not set info panel on hover
      })
      .on("mouseout", function () {
        linkElems
          .attr("stroke", "#7db7e8")
          .attr("stroke-width", 1)
          .attr("opacity", 0.15);
        nodeElems
          .classed("node--source", false)
          .classed("node--target", false)
          .classed("node--active", false);
        setHoveredNode(null);
      });

    // Clear selection on SVG background click
    svg.on("click", () => setSelectedNode(null));

    // --- Drag-and-drop for nodes ---
    function dragstarted(event, d) {
      d3.select(this).raise().attr("font-weight", "bold");
      // Snap node to mouse immediately
      dragged(event, d);
    }
    function dragged(event, d) {
      const [cx, cy] = [WIDTH / 2, HEIGHT / 2];
      const [mx, my] = d3.pointer(event, svg.node());
      const dx = mx - cx;
      const dy = my - cy;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (angle < 0) angle += 360;
      const radius = Math.sqrt(dx * dx + dy * dy);
      d.x = angle;
      d.y = Math.max(40, Math.min(radius, RADIUS));
      d3.select(this).attr(
        "transform",
        `rotate(${d.x - 90})translate(${Math.max(0, d.y - 20)},0)${d.x < 180 ? "" : "rotate(180)"}`,
      );
      linkElems.attr("d", linkPath);
      // Persist new position to backend
      fetch(`${API_URL}/${encodeURIComponent(d.data.name)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ angle: d.x, radius: d.y }),
      });
    }
    function dragended(event, d) {
      d3.select(this).attr("font-weight", "normal");
    }
    nodeElems.call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended),
    );

    // --- Zoom ---
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        linkGroup.attr(
          "transform",
          event.transform + ` translate(${WIDTH / 2},${HEIGHT / 2})`,
        );
        nodeGroup.attr(
          "transform",
          event.transform + ` translate(${WIDTH / 2},${HEIGHT / 2})`,
        );
        setZoomTransform(event.transform);
      });
    svg.call(zoom);
    svg.on("dblclick.zoom", null);
    zoomRef.current = zoom;

    // Center the visualization
    svg.attr("viewBox", [0, 0, WIDTH, HEIGHT]);
    linkGroup.attr("transform", `translate(${WIDTH / 2},${HEIGHT / 2})`);
    nodeGroup.attr("transform", `translate(${WIDTH / 2},${HEIGHT / 2})`);
  }, [data, fontSize]);

  // Controls
  const handleZoom = (delta) => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    const newScale = Math.max(0.5, Math.min(3, zoomTransform.k + delta));
    const newTransform = d3.zoomIdentity
      .translate(zoomTransform.x, zoomTransform.y)
      .scale(newScale);
    svg
      .transition()
      .duration(200)
      .call(zoomRef.current.transform, newTransform);
  };
  const handleFontSize = (delta) => {
    setFontSize((f) => Math.max(8, Math.min(24, f + delta)));
  };

  // Add node submit handler
  const handleAddNode = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newNodeName, imports: newNodeImports }),
      });
      setShowAddModal(false);
      setNewNodeName("");
      setNewNodeImports([]);
      setSubmitting(false);
      // Refetch data
      fetch(API_URL)
        .then((res) => res.json())
        .then((d) => {
          const processed = Array.isArray(d) ? d : d.data;
          setData(processed);
        });
    } catch (err) {
      alert("Failed to add node");
      setSubmitting(false);
    }
  };

  // Delete node handler
  const handleDeleteNode = async (name) => {
    setDeletingNode(name);
    setShowDeleteConfirm(true);
  };
  const confirmDeleteNode = async () => {
    if (!deletingNode) return;
    try {
      await fetch(`${API_URL}/${encodeURIComponent(deletingNode)}`, {
        method: "DELETE",
      });
      setShowDeleteConfirm(false);
      setDeletingNode(null);
      // Refetch data
      fetch(API_URL)
        .then((res) => res.json())
        .then((d) => {
          const processed = Array.isArray(d) ? d : d.data;
          setData(processed);
        });
      setHoveredNode(null);
    } catch (err) {
      alert("Failed to delete node");
      setShowDeleteConfirm(false);
      setDeletingNode(null);
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "row", maxWidth: WIDTH + 220 }}
    >
      <div
        style={{ display: "flex", flexDirection: "column", marginBottom: 40 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 20,
            marginTop: 10,
          }}
        >
          <button
            style={{
              background: "none",
              outline: "none",
              border: "none",
              cursor: "pointer",
              color: "#0000FF",
              fontSize: 18,
              paddingLeft: 20,
            }}
            onClick={() => setShowAddModal(true)}
            title="Add Node"
          >
            <FaPlus />
          </button>
          <div>
            <button onClick={() => handleZoom(0.2)}>Zoom In</button>
            <button onClick={() => handleZoom(-0.2)}>Zoom Out</button>
            <button onClick={() => handleFontSize(2)}>A+</button>
            <button onClick={() => handleFontSize(-2)}>A-</button>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: "center" }}>Loading...</div>
        ) : (
          <svg
            ref={svgRef}
            width={WIDTH}
            height={HEIGHT}
            style={{ background: "#fff" }}
          />
        )}
        {/* Modal for adding a node */}
        {showAddModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: 24,
                borderRadius: 8,
                minWidth: 320,
                boxShadow: "0 2px 16px #0002",
              }}
            >
              <h3>Add Node</h3>
              <form onSubmit={handleAddNode}>
                <div style={{ marginBottom: 12 }}>
                  <label>
                    Node Name:
                    <br />
                    <input
                      type="text"
                      value={newNodeName}
                      onChange={(e) => setNewNodeName(e.target.value)}
                      required
                      style={{ width: "100%", padding: 6, fontSize: 16 }}
                    />
                  </label>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>
                    Imports (cross-references):
                    <br />
                    <select
                      multiple
                      value={newNodeImports}
                      onChange={(e) =>
                        setNewNodeImports(
                          Array.from(e.target.selectedOptions, (o) => o.value),
                        )
                      }
                      style={{ width: "100%", minHeight: 80, fontSize: 16 }}
                    >
                      {allNodeNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting || !newNodeName}>
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <div
        style={{
          width: 220,
          padding: 16,
          background: "#fff",
          color: "#2d3a4a",
          paddingTop: 20,
        }}
      >
        <h3>Info Panel</h3>
        {selectedNode ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <b>{selectedNode.label || selectedNode.name}</b>
              <button
                style={{
                  background: "none",
                  outline: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#e74c3c",
                  fontSize: 18,
                  padding: 0,
                }}
                title="Delete Node"
                onClick={() => handleDeleteNode(selectedNode.name)}
              >
                <FaTrash />
              </button>
            </div>
            <div>Cross-references:</div>
            <ul>
              {selectedNode.imports && selectedNode.imports.length > 0 ? (
                selectedNode.imports.map((imp, i) => <li key={i}>{imp}</li>)
              ) : (
                <li>None</li>
              )}
            </ul>
          </div>
        ) : (
          <div>Select a node to see details.</div>
        )}
        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: 24,
                borderRadius: 8,
                minWidth: 320,
                boxShadow: "0 2px 16px #0002",
              }}
            >
              <h3>Delete Node</h3>
              <p>
                Are you sure you want to delete <b>{deletingNode}</b>?
              </p>
              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
              >
                <button onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteNode}
                  style={{ color: "#fff", background: "#e74c3c" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
