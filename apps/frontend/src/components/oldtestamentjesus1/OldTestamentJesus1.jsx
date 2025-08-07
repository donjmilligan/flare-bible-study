import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  useLayoutEffect,
} from "react";
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
  return d.data && d.data.name ? d.data.name : d.name;
}

function bilink(root) {
  const map = new Map(root.leaves().map((d) => [id(d), d]));
  for (const d of root.leaves()) {
    d.incoming = [];
    d.outgoing = d.data.imports
      .map((i) => [d, map.get(i)])
      .filter(([, target]) => target);
  }
  for (const d of root.leaves()) {
    for (const o of d.outgoing) {
      if (o[1]) {
        o[1].incoming.push(o);
      }
    }
  }
  return root;
}

const colorin = "#00bcd4";
const colorout = "#ff9800";
const colornone = "#aaa";

const OldTestamentJesus1 = React.memo(() => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [textSize, setTextSize] = useState(8);

  // Memoize expensive D3 calculations
  const d3Data = useMemo(() => {
    if (data.length === 0) return null;

    const hierarchy = d3
      .hierarchy(buildHierarchy(data))
      .sum((d) => (d.children ? 0 : 1));
    const width = 754;
    const radius = width / 2 - 150;
    const tree = d3.cluster().size([2 * Math.PI, radius - 100]);
    const root = tree(bilink(hierarchy));

    return { hierarchy, root, width, radius, tree };
  }, [data]);

  // Debounced zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleTextSize = useCallback((event) => {
    const change = event.detail;
    setTextSize((prev) => Math.max(6, Math.min(prev + change, 16)));
  }, []);

  // Fetch data
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3001/api/bible/oldtestamentjesus1")
      .then((res) => res.json())
      .then((json) => {
        setData(json.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  // Event listeners for zoom and text size
  useEffect(() => {
    window.addEventListener("d3-zoom-in", handleZoomIn);
    window.addEventListener("d3-zoom-out", handleZoomOut);
    window.addEventListener("d3-text-size", handleTextSize);

    return () => {
      window.removeEventListener("d3-zoom-in", handleZoomIn);
      window.removeEventListener("d3-zoom-out", handleZoomOut);
      window.removeEventListener("d3-text-size", handleTextSize);
    };
  }, [handleZoomIn, handleZoomOut, handleTextSize]);

  // D3 rendering
  useLayoutEffect(() => {
    if (!d3Data || loading) return;

    const renderFrame = () => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      svg
        .attr("width", d3Data.width)
        .attr("height", d3Data.width)
        .attr("viewBox", [
          -d3Data.width / 2,
          -d3Data.width / 2,
          d3Data.width,
          d3Data.width,
        ]);

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
        .data(d3Data.root.leaves().flatMap((leaf) => leaf.outgoing))
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", ([i, o]) => line(i.path(o)))
        .each(function (d) {
          d.path = this;
        });

      const node = svg
        .append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(d3Data.root.leaves())
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
    };

    requestAnimationFrame(renderFrame);
  }, [d3Data, loading, textSize]);

  // Zoom effect
  useLayoutEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.style("transform", `scale(${zoomLevel})`);
  }, [zoomLevel]);

  return (
    <div className="arc-diagram-container" style={{ position: "relative" }}>
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            fontSize: "16px",
            color: "#666",
          }}
        >
          Loading diagram...
        </div>
      ) : (
        <svg ref={svgRef} />
      )}
    </div>
  );
});

export default OldTestamentJesus1;
