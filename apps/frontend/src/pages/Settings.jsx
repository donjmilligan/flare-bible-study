import React from "react";

const Settings = () => (
  <div style={{ padding: 24 }}>
    <h1>Settings</h1>
    <div style={{ marginBottom: 24 }}>
      <label style={{ fontWeight: 500 }}>Zoom</label>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          className="btn btn-outline"
          onClick={() => window.dispatchEvent(new CustomEvent("d3-zoom-in"))}
        >
          Zoom In
        </button>
        <button
          className="btn btn-outline"
          onClick={() => window.dispatchEvent(new CustomEvent("d3-zoom-out"))}
        >
          Zoom Out
        </button>
      </div>
    </div>
    <div>
      <label style={{ fontWeight: 500 }}>Text Size</label>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          className="btn btn-outline"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("d3-text-size", { detail: 1 }))
          }
        >
          A+
        </button>
        <button
          className="btn btn-outline"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("d3-text-size", { detail: -1 }),
            )
          }
        >
          A-
        </button>
      </div>
    </div>
  </div>
);

export default Settings;
