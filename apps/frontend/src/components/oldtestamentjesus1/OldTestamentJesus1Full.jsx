import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./OldTestamentJesus1.css";

// Helper to build hierarchy from flat data
function buildHierarchy(data) {
  const map = new Map(data.map((d) => [d.name, d]));
  return {
    name: "root",
    children: data.map((d) => ({
      ...d,
      children: [],
    })),
  };
}

// Bilink function using id(d) for mapping
function id(d) {
  // Use a unique identifier for each node; here, we use the name property
  return d.data && d.data.name ? d.data.name : d.name;
}
function bilink(root) {
  const map = new Map(root.leaves().map((d) => [id(d), d]));
  for (const d of root.leaves()) {
    d.incoming = [];
    d.outgoing = d.data.imports.map((i) => [d, map.get(i)]);
  }
  for (const d of root.leaves()) {
    for (const o of d.outgoing) {
      o[1].incoming.push(o);
    }
  }
  return root;
}

const colorin = "#00bcd4";
const colorout = "#ff9800";
const colornone = "#aaa";

const OldTestamentJesus1 = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });
  const [insertForm, setInsertForm] = useState({
    visible: false,
    parent: null,
    name: "",
    imports: [],
    prefix: "",
  });
  const [showHowTo, setShowHowTo] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [textSize, setTextSize] = useState(12);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Fetch data
  useEffect(() => {
    fetch("http://localhost:3001/api/bible/oldtestamentjesus1")
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .catch(console.error);
  }, []);

  // Hide context menu on click elsewhere
  useEffect(() => {
    if (!contextMenu.visible) return;
    const handleClick = () =>
      setContextMenu({ ...contextMenu, visible: false });
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [contextMenu]);

  // D3 rendering
  useEffect(() => {
    if (data.length === 0) return;
    const hierarchy = d3
      .hierarchy(buildHierarchy(data))
      .sum((d) => (d.children ? 0 : 1));
    const width = 754;
    const radius = width / 2 - 150;
    const tree = d3.cluster().size([2 * Math.PI, radius - 100]);
    const root = tree(bilink(hierarchy));
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", width)
      .attr("height", width)
      .attr("viewBox", [-width / 2, -width / 2, width, width])
      .attr("style", "max-width: 90%; height: auto; font: 8px sans-serif;");
    const line = d3
      .lineRadial()
      .curve(d3.curveBundle.beta(0.85))
      .radius((d) => d.y)
      .angle((d) => d.x);
    const links = svg
      .append("g")
      .attr("class", "links")
      .attr("stroke", colornone)
      .attr("fill", "none")
      .selectAll("path")
      .data(root.leaves().flatMap((leaf) => leaf.outgoing))
      .join("path")
      .style("mix-blend-mode", "multiply")
      .attr("d", ([i, o]) => line(i.path(o)))
      .each(function (d) {
        d.path = this;
      });
    const node = svg
      .append("g")
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr(
        "transform",
        (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`,
      );
    node
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => (d.x < Math.PI ? 6 : -6))
      .attr("text-anchor", (d) => (d.x < Math.PI ? "start" : "end"))
      .attr("transform", (d) => (d.x >= Math.PI ? "rotate(180)" : null))
      .text((d) => {
        const name = d.data.name || "";
        const parts = name.split(".");
        return parts[parts.length - 1].trim();
      })
      .each(function (d) {
        d.text = this;
      })
      .on("mouseover", function (event, d) {
        setHoveredNode(d);
        overed.call(this, event, d);
      })
      .on("mouseout", function (event, d) {
        setHoveredNode(null);
        outed.call(this, event, d);
      })
      .on("contextmenu", function (event, d) {
        event.preventDefault();
        setContextMenu({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          node: d,
        });
      })
      .call((text) =>
        text
          .append("title")
          .text(
            (d) =>
              `${d.data.name}\n${d.outgoing.length} outgoing\n${d.incoming.length} incoming`,
          ),
      );
    function overed(event, d) {
      d3.select(this).classed("node--highlighted", true);
      d3.selectAll(d.incoming.map((link) => link.path)).classed(
        "link--incoming",
        true,
      );
      d3.selectAll(d.outgoing.map((link) => link.path)).classed(
        "link--outgoing",
        true,
      );
      d3.selectAll(d.incoming.map(([d]) => d.text)).classed(
        "text--incoming",
        true,
      );
      d3.selectAll(d.outgoing.map(([, d]) => d.text)).classed(
        "text--outgoing",
        true,
      );
    }
    function outed(event, d) {
      d3.select(this).classed("node--highlighted", false);
      d3.selectAll(d.incoming.map((link) => link.path)).classed(
        "link--incoming",
        false,
      );
      d3.selectAll(d.outgoing.map((link) => link.path)).classed(
        "link--outgoing",
        false,
      );
      d3.selectAll(d.incoming.map(([d]) => d.text)).classed(
        "text--incoming",
        false,
      );
      d3.selectAll(d.outgoing.map(([, d]) => d.text)).classed(
        "text--outgoing",
        false,
      );
    }
  }, [data]);

  // Delete node handler
  const handleDelete = async (node) => {
    if (!window.confirm(`Delete node: ${node.data.name}?`)) return;
    await fetch(
      `http://localhost:3001/api/bible/oldtestamentjesus1/${encodeURIComponent(node.data.name)}`,
      {
        method: "DELETE",
      },
    );
    setContextMenu({ ...contextMenu, visible: false });
    // Refresh data
    fetch("http://localhost:3001/api/bible/oldtestamentjesus1")
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .catch(console.error);
  };

  // Insert node handler
  const handleInsert = (parentNode) => {
    setInsertForm({
      visible: true,
      parent: parentNode,
      name: "",
      imports: [],
      prefix: "",
    });
    setContextMenu({ ...contextMenu, visible: false });
  };
  const handleInsertSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:3001/api/bible/oldtestamentjesus1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: insertForm.name,
        imports: insertForm.imports,
      }),
    });
    setInsertForm({ visible: false, parent: null, name: "", imports: [] });
    // Refresh data
    fetch("http://localhost:3001/api/bible/oldtestamentjesus1")
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .catch(console.error);
  };

  // Zoom handlers (stubbed for now)
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.1, 0.5));
  const handleTextSize = () => setTextSize((s) => (s >= 20 ? 12 : s + 2));

  // Helper to get all unique node names (last part after last dot)
  const allNodeNames = Array.from(
    new Set(
      data.map((d) => {
        const idx = d.name.lastIndexOf(".");
        return idx !== -1 ? d.name.slice(idx + 1).trim() : d.name;
      }),
    ),
  );
  // Helper to get all unique prefixes (everything up to and including the last dot)
  const allPrefixes = Array.from(
    new Set(
      data.map((d) => {
        const idx = d.name.lastIndexOf(".");
        return idx !== -1 ? d.name.slice(0, idx + 1) : "";
      }),
    ),
  ).filter(Boolean);

  return (
    <div className="arc-diagram-container" style={{ position: "relative" }}>
      <svg ref={svgRef} style={{ transform: `scale(${zoomLevel})` }} />
      {/* Floating Toolbar */}
      <div className="floating-toolbar">
        <button title="Zoom In" onClick={handleZoomIn}>
          Zoom In
        </button>
        <button title="Zoom Out" onClick={handleZoomOut}>
          Zoom Out
        </button>
        <button title="Text Size" onClick={handleTextSize}>
          <span style={{ fontSize: "1.2em" }}>Text Size</span>
        </button>
        <button title="How To" onClick={() => setShowHowTo(true)}>
          How To
        </button>
        <button title="About" onClick={() => setShowAbout(true)}>
          About
        </button>
      </div>
      {/* How To Modal */}
      {showHowTo && (
        <div className="modal-overlay" onClick={() => setShowHowTo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>How To</h2>
            <p>
              Use the toolbar to zoom, change text size, or learn more about
              this diagram. Right-click nodes for more options.
            </p>
            <button onClick={() => setShowHowTo(false)}>Close</button>
          </div>
        </div>
      )}
      {/* About Modal */}
      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>About</h2>
            <p>
              This visualization shows Old Testament connections using D3.js.
              Created for Flare Bible Study.
            </p>
            <button onClick={() => setShowAbout(false)}>Close</button>
          </div>
        </div>
      )}
      {contextMenu.visible && (
        <div
          className="arc-diagram-context-menu"
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
            background: "#fff",
            border: "1px solid #ccc",
            padding: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            display: "flex",
            gap: "8px",
          }}
        >
          <button
            onClick={() => handleDelete(contextMenu.node)}
            style={{
              background: "none",
              border: "none",
              color: "red",
              fontSize: "10px",
              fontWeight: 400,
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
            title="Delete Node"
          >
            Delete Node
          </button>
          <button
            onClick={() => handleInsert(contextMenu.node)}
            style={{
              background: "none",
              border: "none",
              color: "#2196f3",
              fontSize: "10px",
              fontWeight: 400,
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
            title="Insert Node"
          >
            Insert Node
          </button>
        </div>
      )}
      {/* Insert node form */}
      {insertForm.visible && (
        <div
          className="arc-diagram-insert-form"
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -30%)",
            zIndex: 2000,
            background: "#fff",
            border: "1px solid #ccc",
            padding: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Combine prefix and name for the full node name
              const fullName = (insertForm.prefix || "") + insertForm.name;
              fetch("http://localhost:3001/api/bible/oldtestamentjesus1", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: fullName,
                  imports: insertForm.imports,
                }),
              }).then(() => {
                setInsertForm({
                  visible: false,
                  parent: null,
                  name: "",
                  imports: [],
                  prefix: allPrefixes[0] || "",
                });
                // Refresh data
                fetch("http://localhost:3001/api/bible/oldtestamentjesus1")
                  .then((res) => res.json())
                  .then((json) => setData(json.data))
                  .catch(console.error);
              });
            }}
          >
            <div>
              <b>Insert Node</b>
            </div>
            <div>
              <label>
                Prefix:
                <select
                  value={insertForm.prefix || allPrefixes[0] || ""}
                  onChange={(e) =>
                    setInsertForm((f) => ({ ...f, prefix: e.target.value }))
                  }
                  style={{ marginLeft: 8 }}
                >
                  {allPrefixes.map((prefix) => (
                    <option key={prefix} value={prefix}>
                      {prefix}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label>
                Name:{" "}
                <input
                  value={insertForm.name}
                  onChange={(e) =>
                    setInsertForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  style={{ marginLeft: 8 }}
                />
              </label>
            </div>
            <div style={{ margin: "8px 0" }}>
              <label>Imports:</label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  marginBottom: "4px",
                }}
              >
                {insertForm.imports.map((name, idx) => (
                  <span
                    key={name}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      background: "#e0e0e0",
                      borderRadius: "12px",
                      padding: "2px 8px",
                      marginRight: "4px",
                    }}
                  >
                    {name}
                    <span
                      style={{
                        marginLeft: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                      onClick={() =>
                        setInsertForm((f) => ({
                          ...f,
                          imports: f.imports.filter((n, i) => i !== idx),
                        }))
                      }
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
              <select
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !insertForm.imports.includes(val)) {
                    setInsertForm((f) => ({
                      ...f,
                      imports: [...f.imports, val],
                    }));
                  }
                }}
                style={{ width: "200px" }}
              >
                <option value="" disabled>
                  Select import...
                </option>
                {allNodeNames
                  .filter((name) => !insertForm.imports.includes(name))
                  .map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
              </select>
            </div>
            <div style={{ marginTop: 8 }}>
              <button type="submit">Add</button>
              <button
                type="button"
                onClick={() =>
                  setInsertForm({
                    visible: false,
                    parent: null,
                    name: "",
                    imports: [],
                    prefix: allPrefixes[0] || "",
                  })
                }
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OldTestamentJesus1;
