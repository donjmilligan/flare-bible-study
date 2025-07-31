import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { renderEdgeBundling } from "../../d3/edgeBundling";

const API_URL = "http://localhost:3001/api/bible/oldtestamentjesus1";

const WIDTH = 600; // Increased for full width
const HEIGHT = 600;
const MARGIN = 50;
const FONT_SIZE = 10;
const RADIUS = Math.max(80, Math.min(WIDTH, HEIGHT) / 2 - MARGIN); // minimum radius 80
const FONT_FAMILY = "Times New Roman, Times, serif";

export default function OldTestamentJesus1() {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((d) => {
        // Preprocess: convert 'related' to 'imports' as an array
        const processed = (d.data || []).map((item) => ({
          ...item,
          imports: item.related ? JSON.parse(item.related) : [],
        }));
        console.log("Processed data:", processed); // Debug log
        setData(processed);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!data.length) return;
    renderEdgeBundling({
      container: svgRef.current,
      data,
      width: WIDTH,
      height: HEIGHT,
      margin: MARGIN,
      fontFamily: FONT_FAMILY,
      fontSize: FONT_SIZE,
    });
  }, [data]);

  return (
    <div
      className="radial-bundle-container"
      style={{ display: "flex", maxWidth: WIDTH, margin: "0 auto" }}
    >
      <div
        className="diagram"
        style={{
          flex: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center" }}>Loading...</div>
        ) : (
          <svg ref={svgRef} className="radial-bundle-svg" />
        )}
      </div>
      <div className="info-panel" style={{ flex: 4 }}>
        <h3>Info Panel</h3>
        <div>
          {/* Add dynamic or static info here */}
          Select a node to see details.
        </div>
      </div>
    </div>
  );
}
