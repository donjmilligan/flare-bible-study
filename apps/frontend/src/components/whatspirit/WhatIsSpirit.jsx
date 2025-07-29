import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./WhatIsSpirit.css";

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
    d.outgoing = d.data.imports
      .map((i) => [d, map.get(i)])
      .filter(([, target]) => target); // Only include valid targets
  }
  for (const d of root.leaves()) {
    for (const o of d.outgoing) {
      if (o[1]) {
        // Guard against undefined targets
        o[1].incoming.push(o);
      }
    }
  }
  return root;
}

const colorin = "#00bcd4";
const colorout = "#ff9800";
const colornone = "#aaa";

const WhatIsSpirit = () => {
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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [textSize, setTextSize] = useState(8);
  const [editingNode, setEditingNode] = useState(null);
  const [editName, setEditName] = useState("");

  // Fetch data
  useEffect(() => {
    fetch("http://localhost:3001/api/bible/whatisspirit")
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .catch(console.error);
  }, []);

  // Event listeners for zoom and text size
  useEffect(() => {
    const handleZoomIn = () => {
      setZoomLevel((prev) => Math.min(prev + 0.1, 2));
    };

    const handleZoomOut = () => {
      setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
    };

    const handleTextSize = (event) => {
      const change = event.detail;
      setTextSize((prev) => Math.max(6, Math.min(prev + change, 16)));
    };

    window.addEventListener("d3-zoom-in", handleZoomIn);
    window.addEventListener("d3-zoom-out", handleZoomOut);
    window.addEventListener("d3-text-size", handleTextSize);

    return () => {
      window.removeEventListener("d3-zoom-in", handleZoomIn);
      window.removeEventListener("d3-zoom-out", handleZoomOut);
      window.removeEventListener("d3-text-size", handleTextSize);
    };
  }, []);

  // Hide context menu on click elsewhere
  useEffect(() => {
    if (!contextMenu.visible) return;
    const handleClick = (event) => {
      // Don't close if clicking on the context menu itself
      if (event.target.closest(".arc-diagram-context-menu")) return;
      setContextMenu({ ...contextMenu, visible: false });
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };
    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextMenu]);

  // Handle rename functionality
  const handleRename = (node) => {
    const currentName = node.data.name || "";
    const parts = currentName.split(".");
    const nodeName = parts[parts.length - 1].trim();
    setEditName(nodeName);
    setEditingNode(node);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleRenameSubmit = async () => {
    if (!editingNode || !editName.trim()) return;

    const currentName = editingNode.data.name;
    const parts = currentName.split(".");
    const prefix = parts.length > 1 ? parts.slice(0, -1).join(".") + "." : "";
    const newFullName = prefix + editName.trim();

    try {
      // Delete the old node
      await fetch(
        `http://localhost:3001/api/bible/whatisspirit/${encodeURIComponent(currentName)}`,
        {
          method: "DELETE",
        },
      );

      // Create a new node with the new name
      await fetch("http://localhost:3001/api/bible/whatisspirit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFullName,
          imports: editingNode.data.imports || [],
        }),
      });

      // Refresh data
      const response = await fetch(
        "http://localhost:3001/api/bible/whatisspirit",
      );
      const json = await response.json();
      setData(json.data);

      setEditingNode(null);
      setEditName("");
    } catch (error) {
      console.error("Error renaming node:", error);
      alert("Failed to rename node. Please try again.");
    }
  };

  const handleRenameCancel = () => {
    setEditingNode(null);
    setEditName("");
  };

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
      .attr(
        "style",
        `max-width: 90%; height: auto; font: ${textSize}px sans-serif; transform: scale(${zoomLevel}); transform-origin: center;`,
      );
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
      .style("font-size", `${textSize}px`)
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
        event.stopPropagation();
        console.log("Right-clicked node:", d);

        // Get the SVG container's bounding rect
        const svgContainer = svgRef.current.closest(".arc-diagram-container");
        const containerRect = svgContainer.getBoundingClientRect();

        // Calculate position relative to the container
        const x = event.clientX - containerRect.left;
        const y = event.clientY - containerRect.top;

        setContextMenu({ visible: true, x: x, y: y, node: d });
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
  }, [data, zoomLevel, textSize]);

  // Delete node handler
  const handleDelete = async (node) => {
    if (!window.confirm(`Delete node: ${node.data.name}?`)) return;
    await fetch(
      `http://localhost:3001/api/bible/whatisspirit/${encodeURIComponent(node.data.name)}`,
      {
        method: "DELETE",
      },
    );
    setContextMenu({ ...contextMenu, visible: false });
    // Refresh data
    fetch("http://localhost:3001/api/bible/whatisspirit")
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

  // Helper to get full node names for imports
  const allFullNodeNames = data.map((d) => d.name);

  return (
    <div className="arc-diagram-container" style={{ position: "relative" }}>
      <svg ref={svgRef} />
      {contextMenu.visible && (
        <div
          className="arc-diagram-context-menu"
          style={{
            position: "absolute",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 9999,
            background: "#fff",
            border: "1px solid #ccc",
            padding: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            display: "flex",
            gap: "8px",
            borderRadius: "6px",
            minWidth: "120px",
          }}
        >
          <button
            onClick={() => handleRename(contextMenu.node)}
            style={{
              background: "none",
              border: "none",
              color: "#2196f3",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: "4px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f8ff")}
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
            title="Rename Node"
          >
            Rename
          </button>
          <button
            onClick={() => handleDelete(contextMenu.node)}
            style={{
              background: "none",
              border: "none",
              color: "#f44336",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: "4px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#ffebee")}
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
            title="Delete Node"
          >
            Delete
          </button>
          <button
            onClick={() => handleInsert(contextMenu.node)}
            style={{
              background: "none",
              border: "none",
              color: "#4caf50",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: "4px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#f1f8e9")}
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
            title="Insert Node"
          >
            Insert
          </button>
        </div>
      )}
      {/* Rename form */}
      {editingNode && (
        <div
          className="arc-diagram-rename-form"
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
              handleRenameSubmit();
            }}
          >
            <div>
              <b>Rename Node</b>
            </div>
            <div style={{ margin: "8px 0" }}>
              <label>
                New Name:{" "}
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  style={{ marginLeft: 8 }}
                />
              </label>
            </div>
            <div style={{ marginTop: 8 }}>
              <button type="submit">Save</button>
              <button type="button" onClick={handleRenameCancel}>
                Cancel
              </button>
            </div>
          </form>
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
              fetch("http://localhost:3001/api/bible/whatisspirit", {
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
                fetch("http://localhost:3001/api/bible/whatisspirit")
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
                {allFullNodeNames
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

export default WhatIsSpirit;
