import * as d3 from "d3";

export function renderEdgeBundling({
  container,
  data,
  width = 600,
  height = 600,
  margin = 60,
  fontFamily = "Times New Roman, Times, serif",
  fontSize = 16,
}) {
  // Remove previous content
  const svg = d3.select(container);
  svg.selectAll("*").remove();

  // --- Data Preparation ---
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
  function packageImports(nodes) {
    const map = {},
      imports = [];
    nodes.forEach((d) => {
      map[d.name] = d;
    });
    nodes.forEach((d) => {
      if (d.imports)
        d.imports.forEach((i) => {
          if (map[i]) imports.push({ source: map[d.name], target: map[i] });
        });
    });
    return imports;
  }

  // --- Layout ---
  const RADIUS = Math.min(width, height) / 2 - margin;
  const cluster = d3.cluster().size([360, RADIUS]);
  const root = d3.hierarchy(packageHierarchy(data));
  cluster(root);
  const nodes = root.leaves();
  const links = packageImports(nodes.map((d) => d.data));
  console.log("Number of links:", links.length); // Debug log

  // --- Draw links (edges) ---
  const line = d3
    .lineRadial()
    .curve(d3.curveBundle.beta(0.85))
    .radius((d) => d.y)
    .angle((d) => (d.x / 180) * Math.PI);

  const linkGroup = svg.append("g").attr("class", "links");
  const nodeGroup = svg.append("g").attr("class", "nodes");

  // Helper to get path for a link
  function linkPath(link) {
    // Path goes from source up to root, then down to target
    return line(
      link.source.path(root).reverse().concat(link.target.path(root).slice(1)),
    );
  }

  // Draw all links
  const linkElems = linkGroup
    .selectAll("path.link")
    .data(links)
    .join("path")
    .attr("class", "link")
    .attr("d", linkPath)
    .attr("fill", "none")
    .attr("stroke", "#7db7e8")
    .attr("stroke-width", 1.2)
    .attr("opacity", 0.3); // All links visible by default

  // --- Draw nodes (text only) ---
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
    .style("font-family", fontFamily)
    .style("cursor", "pointer");

  // --- Interactivity: highlight links/nodes on hover ---
  nodeElems
    .on("mouseover", function (event, d) {
      // Highlight links where this node is the source or target
      linkElems
        .attr("stroke", (l) =>
          l.source === d || l.target === d ? "#e74c3c" : "#7db7e8",
        )
        .attr("opacity", (l) => (l.source === d || l.target === d ? 1 : 0.15))
        .attr("stroke-width", (l) =>
          l.source === d || l.target === d ? 2.5 : 1.2,
        );
      nodeElems
        .attr("fill", (n) => {
          if (n === d) return "#e74c3c";
          // Highlight target nodes of imports (cross-references)
          const isTarget = links.some(
            (l) => (l.source === d || l.target === d) && l.target === n,
          );
          return isTarget ? "#3498db" : "#222";
        })
        .attr("font-weight", (n) => (n === d ? "bold" : "normal"));
    })
    .on("mouseout", function () {
      linkElems
        .attr("stroke", "#7db7e8")
        .attr("opacity", 0.3)
        .attr("stroke-width", 1.2);
      nodeElems.attr("fill", "#2d3a4a").attr("font-weight", "normal");
    });

  // Center the visualization
  svg.attr("viewBox", [0, 0, width, height]);
  linkGroup.attr("transform", `translate(${width / 2},${height / 2})`);
  nodeGroup.attr("transform", `translate(${width / 2},${height / 2})`);
}
