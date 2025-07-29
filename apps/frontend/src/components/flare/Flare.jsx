import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./Flare.css";

const API_BASE = "http://localhost:3001/api/bible";

const COLORS = ["Blue", "Purple", "Black", "Rainbow"];
const SUBJECTS = [
  "All",
  "God",
  "Jesus",
  "Love",
  "Sabbath",
  "What is",
  "State of the Dead",
  "Paradoxes",
  "Works",
  "Faith",
  "Grace",
  "Other",
];

const TRANSLATION_LABELS = {
  kjv: "King James Version",
  asv: "American Standard Version",
  darby: "Darby English Bible",
  basic: "Bible In Basic English",
  webster: "Webster's Bible",
  web: "World English Bible",
  ylt: "Young's Literal Translation",
};

const TRANSLATION_ORDER = [
  "kjv",
  "asv",
  "darby",
  "basic",
  "webster",
  "web",
  "ylt",
];

const TRANSLATIONS = [
  { value: "kjv", label: "King James Version" },
  { value: "asv", label: "American Standard Version" },
  { value: "darby", label: "Darby English Bible" },
  { value: "basic", label: "Bible In Basic English" },
  { value: "webster", label: "Webster's Bible" },
  { value: "web", label: "World English Bible" },
  { value: "ylt", label: "Young's Literal Translation" },
];

function getArcColor(color, start, end) {
  if (color === "Blue") return "#1D84B2";
  if (color === "Purple") return "#6e4b91";
  if (color === "Black") return "#444";
  if (color === "Rainbow") {
    const distance = Math.abs(end - start);
    return d3.hsl((distance / 1189) * 360, 0.7, 0.35);
  }
  return "#1D84B2";
}

function normalizeRef(ref) {
  return (ref || "")
    .replace(/([a-zA-Z])([0-9])/g, "$1 $2")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function extractBookAndChapter(ref) {
  // More robust regex pattern similar to the old implementation
  const parts = /^(\d?\s?[a-z]+)[\s.:]*(\d*):?(\d*)[-]?(\d*)/i.exec(ref);
  if (parts && parts[1] && parts[2]) {
    return `${parts[1].replace(/\s+/g, " ").trim()} ${parts[2]}`;
  }

  // Fallback patterns for edge cases
  // Try to match e.g. "Genesis 2:1-3" or "Genesis 2:1"
  const match = (ref || "").match(/^([1-3]?\s*[A-Za-z ]+)\s+(\d+):/);
  if (match) {
    return `${match[1].replace(/\s+/g, " ").trim()} ${match[2]}`;
  }
  // Try to match "Genesis 2"
  const match2 = (ref || "").match(/^([1-3]?\s*[A-Za-z ]+)\s+(\d+)/);
  if (match2) {
    return `${match2[1].replace(/\s+/g, " ").trim()} ${match2[2]}`;
  }
  // Try to match "Genesis2:1" (no space)
  const match3 = (ref || "").match(/^([1-3]?\s*[A-Za-z]+)(\d+):/);
  if (match3) {
    return `${match3[1].replace(/\s+/g, " ").trim()} ${match3[2]}`;
  }
  // Try to match "Genesis2" (no space)
  const match4 = (ref || "").match(/^([1-3]?\s*[A-Za-z]+)(\d+)/);
  if (match4) {
    return `${match4[1].replace(/\s+/g, " ").trim()} ${match4[2]}`;
  }
  return null;
}

// Improved function to get absolute chapter index (like the old getAbsoluteChapter)
function getAbsoluteChapterIndex(ref, chapters) {
  const extracted = extractBookAndChapter(ref);
  if (!extracted) return null;

  const normalizedRef = normalizeRef(extracted);

  // Try exact match first
  let chapterIndex = chapters.findIndex(
    (ch) => normalizeRef(ch.name) === normalizedRef,
  );

  // If no exact match, try to match just the book name and chapter number
  if (chapterIndex === -1) {
    const parts = extracted.split(" ");
    const chapterNum = parts[parts.length - 1];
    const bookName = parts.slice(0, -1).join(" ");

    // Try to find a chapter that matches the book and chapter number
    chapterIndex = chapters.findIndex((ch) => {
      const chParts = ch.name.split(" ");
      const chChapterNum = chParts[chParts.length - 1];
      const chBookName = chParts.slice(0, -1).join(" ");

      return (
        normalizeRef(chBookName) === normalizeRef(bookName) &&
        chChapterNum === chapterNum
      );
    });
  }

  console.log(
    `getAbsoluteChapterIndex: "${ref}" -> "${extracted}" -> "${normalizedRef}" -> index: ${chapterIndex}`,
  );
  return chapterIndex >= 0 ? chapterIndex : null;
}

// Improved function to flatten refs (like the old flatRefs function)
function flatRefs(refs) {
  if (Array.isArray(refs)) {
    return refs;
  } else if (typeof refs === "object" && refs !== null) {
    // This is an object with more info, so let's pull out all the refs
    const refList = [];
    const keys = Object.keys(refs);
    for (let i = 0; i < keys.length; i++) {
      if (Array.isArray(refs[keys[i]])) {
        for (let j = 0; j < refs[keys[i]].length; j++) {
          refList.push(refs[keys[i]][j]);
        }
      }
    }
    return refList;
  }
  return [];
}

const Flare = () => {
  const [translations, setTranslations] = useState(TRANSLATIONS);
  const [translation, setTranslation] = useState("kjv");
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [color, setColor] = useState("Blue");
  const [subject, setSubject] = useState("All");
  const [error, setError] = useState(null);
  const [paradoxes, setParadoxes] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [chapterIndexMap, setChapterIndexMap] = useState({});
  const arcSvgRef = useRef();
  // Add a state for the currently clicked arc's chapters
  const [clickedArcChapters, setClickedArcChapters] = useState([]);
  const mediumWidth = 900;
  const mediumHeight = 400;

  // Fetch books and chapters on translation change
  useEffect(() => {
    setError(null);
    setSelectedBook("");
    setChapters([]);
    setChapterIndexMap({});
    fetch(`${API_BASE}/${translation}/books`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBooks(data);
          Promise.all(
            data.map((book) =>
              fetch(`${API_BASE}/books/${book.id}/chapters`)
                .then((res) => (res.ok ? res.json() : []))
                .catch(() => []),
            ),
          ).then((allChapters) => {
            let chaptersArr = [];
            let chapterMap = {};
            let idx = 0;
            data.forEach((book, i) => {
              chapterMap[book.short_name] = idx;
              const chaptersList = Array.isArray(allChapters[i])
                ? allChapters[i]
                : [];
              chaptersList.forEach((ch) => {
                // Extract chapter number from name field (e.g., "Chapter 1" -> 1)
                let chapterNum = 1;
                if (ch.name) {
                  const match = ch.name.match(/Chapter\s+(\d+)/i);
                  if (match) {
                    chapterNum = parseInt(match[1]);
                  } else {
                    // Try to extract number from any format
                    const numMatch = ch.name.match(/(\d+)/);
                    if (numMatch) {
                      chapterNum = parseInt(numMatch[1]);
                    }
                  }
                }

                chaptersArr.push({
                  book: book.short_name,
                  bookId: book.id,
                  chapterNum: chapterNum,
                  verseCount: ch.verse_count,
                  wordCount: ch.word_count,
                  charCount: ch.char_count,
                  name: `${book.short_name} ${chapterNum}`,
                  section: book.section || "",
                  version: translation,
                });
                idx++;
              });
            });
            setChapters(chaptersArr);
            setChapterIndexMap(chapterMap);
          });
        } else {
          setBooks([]);
          setError("Books data is not an array or not found.");
        }
      })
      .catch((err) => setError("Failed to fetch books: " + err.message));
  }, [translation]);

  // Fetch paradoxes (relationships) from API
  useEffect(() => {
    fetch(`${API_BASE}/paradoxes`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Raw paradoxes data from API:", data);
        if (Array.isArray(data) && data.length > 0) {
          setParadoxes(data);
        } else {
          console.log("No paradoxes from API, using sample data for testing");
          // Use sample data for testing if API doesn't return data
          setParadoxes([
            {
              group_name: "Test",
              description: "Test Paradox",
              refs: ["Genesis 1", "Genesis 2", "Exodus 1"],
              url: "",
            },
            {
              group_name: "Test2",
              description: "Another Test Paradox",
              refs: ["Genesis 3", "Exodus 2", "Leviticus 1"],
              url: "",
            },
          ]);
        }
      })
      .catch((err) => {
        console.error("Error fetching paradoxes:", err);
        console.log("Using sample paradox data due to API error");
        setParadoxes([
          {
            group_name: "Test",
            description: "Test Paradox",
            refs: ["Genesis 1", "Genesis 2", "Exodus 1"],
            url: "",
          },
          {
            group_name: "Test2",
            description: "Another Test Paradox",
            refs: ["Genesis 3", "Exodus 2", "Leviticus 1"],
            url: "",
          },
        ]);
      });
  }, []);

  // Filtering logic
  const filteredParadoxes = paradoxes.filter((par) => {
    console.log(`Filtering paradox: "${par.description || par.desc}"`);

    if (subject !== "All") {
      const desc = (par.description || par.desc || "").toLowerCase();
      const group = (par.group_name || "").toLowerCase();
      if (
        !desc.includes(subject.toLowerCase()) &&
        !group.includes(subject.toLowerCase())
      ) {
        console.log(`  - Filtered out by subject: ${subject}`);
        return false;
      }
    }
    if (selectedBook && books.length > 0) {
      const bookObj = books.find((b) => String(b.id) === String(selectedBook));
      if (!bookObj) {
        console.log(`  - Filtered out: book not found for id ${selectedBook}`);
        return false;
      }
      const bookName = (bookObj.short_name || bookObj.name || "").toLowerCase();
      let refs = [];
      if (Array.isArray(par.refs)) {
        refs = par.refs;
      } else if (typeof par.refs === "object" && par.refs !== null) {
        refs = Object.values(par.refs).flat();
      }
      const hasBook = refs.some((ref) => ref.toLowerCase().includes(bookName));
      if (!hasBook) {
        console.log(`  - Filtered out: no references to book ${bookName}`);
        return false;
      }
    }
    console.log(`  - Passed filtering`);
    return true;
  });

  console.log("Filtered paradoxes:", filteredParadoxes);
  console.log(
    "Available chapters:",
    chapters.map((ch) => ch.name),
  );
  console.log(
    "Available books:",
    books.map((b) => b.short_name),
  );

  // D3 Arc Diagram (horizontal, per chapter, thin bars, arcs above)
  useEffect(() => {
    if (!chapters.length || !books.length) return;

    console.log(
      "Available chapters:",
      chapters.map((ch) => ch.name),
    );
    console.log(
      "Available books:",
      books.map((b) => b.short_name),
    );

    // Prepare arc data (between chapters based on paradoxes)
    const arcLinks = [];
    console.log("Creating arcs from", filteredParadoxes.length, "paradoxes");

    filteredParadoxes.forEach((par, pi) => {
      // Use the improved flatRefs function to handle both array and object structures
      const refs = flatRefs(par.refs);

      console.log(`Paradox ${pi}:`, par.description || par.desc, "refs:", refs);

      // Get absolute chapter indices for all references in this paradox
      const chapterIndices = refs
        .map((ref) => {
          const extracted = extractBookAndChapter(ref);
          const index = getAbsoluteChapterIndex(ref, chapters);
          console.log(
            `Ref: "${ref}" -> extracted: "${extracted}" -> index: ${index}`,
          );
          return index;
        })
        .filter(
          (index) => index !== null && index >= 0 && index < chapters.length,
        );

      console.log(`Paradox ${pi} chapterIndices:`, chapterIndices);

      // Remove duplicates and sort
      const uniqueChapterIndexes = [...new Set(chapterIndices)].sort(
        (a, b) => a - b,
      );

      console.log(`Paradox ${pi} uniqueChapterIndexes:`, uniqueChapterIndexes);

      // Create arcs between consecutive chapters that share this paradox (like the old implementation)
      for (let i = 0; i < uniqueChapterIndexes.length - 1; i++) {
        const start = uniqueChapterIndexes[i];
        const end = uniqueChapterIndexes[i + 1];

        // Re-order if start > end (like the old implementation)
        const finalStart = start > end ? end : start;
        const finalEnd = start > end ? start : end;

        arcLinks.push({
          source: finalStart,
          target: finalEnd,
          desc: par.description || par.desc,
          group: par.group_name,
          refs: refs,
          paradoxId: par.id || pi,
          startVerse: refs[i] || "",
          endVerse: refs[i + 1] || "",
        });
      }
    });

    console.log("Final arcLinks:", arcLinks);

    // Add a test arc to verify rendering works
    if (arcLinks.length === 0 && chapters.length > 1) {
      console.log(
        "No paradox arcs found, adding test arc between first two chapters",
      );
      arcLinks.push({
        source: 0,
        target: 1,
        desc: "Test Arc",
        group: "Test",
        refs: ["Test"],
        paradoxId: "test",
        startVerse: "Test",
        endVerse: "Test",
      });
    }

    // Add more test arcs if we have chapters but no paradox arcs
    if (arcLinks.length === 0 && chapters.length > 5) {
      console.log("Adding multiple test arcs to verify rendering");
      for (let i = 0; i < Math.min(3, chapters.length - 1); i++) {
        arcLinks.push({
          source: i,
          target: i + 1,
          desc: `Test Arc ${i + 1}`,
          group: "Test",
          refs: [`Test ${i + 1}`],
          paradoxId: `test${i}`,
          startVerse: `Test ${i + 1}`,
          endVerse: `Test ${i + 2}`,
        });
      }
    }

    console.log("Final arcLinks after test:", arcLinks);

    // D3 rendering for horizontal arc diagram (bars per chapter, thin bars, arcs above)
    const margin = { top: 20, right: 40, bottom: 40, left: 40 };
    const barWidth = 1.2; // very thin bars
    const barHeight = 100;
    const width =
      Math.max(mediumWidth, chapters.length * (barWidth + 0.5)) +
      margin.left +
      margin.right;
    const height = 520; // Large vertical space for arcs
    const x = d3
      .scaleLinear()
      .domain([0, chapters.length - 1])
      .range([margin.left, width - margin.right]);
    const maxWords = d3.max(chapters, (d) => d.wordCount || 1);
    const yBar = d3.scaleLinear().domain([0, maxWords]).range([0, barHeight]);

    // Bars at the very bottom, arcs start at the top of the bars
    const barY = height - margin.bottom - barHeight;
    const arcBaseY = barY;
    const yBase = barY + barHeight;

    const svg = d3
      .select(arcSvgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);
    svg.selectAll("*").remove();

    // Add clipPath for main chart area
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "main-clip")
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom);

    // Arc drop shadow filter
    svg.append("defs").append("filter").attr("id", "arc-shadow").html(`
        <feDropShadow dx='0' dy='2' stdDeviation='2' flood-color='#000' flood-opacity='0.18'/>
      `);

    // Overlay for info display (small, above rect, follows mouse)
    let overlay = d3.select("#dashboard-overlay");
    if (overlay.empty()) {
      overlay = d3
        .select("body")
        .append("div")
        .attr("id", "dashboard-overlay")
        .style("position", "fixed")
        .style("top", "0px")
        .style("left", "0px")
        .style("width", "auto")
        .style("min-width", "0px")
        .style("max-width", "320px") // reduced width
        .style("height", "auto")
        .style("display", "none")
        .style("align-items", "center")
        .style("justify-content", "center")
        .style("z-index", 9999)
        .style("background", "rgba(40,40,40,0.97)")
        .style("color", "#fff")
        .style("padding", "7px 12px")
        .style("border-radius", "10px")
        .style("font-size", "0.92rem")
        .style("box-shadow", "0 2px 12px rgba(0,0,0,0.18)")
        .style("pointer-events", "none")
        .style("transition", "opacity 0.18s");
    }
    let lastOverlayLeft = 0;
    let lastOverlayTop = 0;
    let overlayMoveAnimation = null;
    function showOverlayAboveRect(html, rectX, rectY, rectWidth) {
      d3.select("#dashboard-overlay").style("display", "flex");
      d3.select("#dashboard-overlay").style("opacity", 1);
      // Only update the text if it changed
      if (d3.select("#dashboard-overlay").html() !== html) {
        d3.select("#dashboard-overlay").html(html);
      }
      // Center overlay horizontally above the rect
      const overlayNode = d3.select("#dashboard-overlay").node();
      const overlayWidth = overlayNode.offsetWidth || 160;
      const left = rectX + rectWidth / 2 - overlayWidth / 2;
      const top = rectY - 38; // 38px above the rect
      // Animate movement
      if (overlayMoveAnimation) cancelAnimationFrame(overlayMoveAnimation);
      function animateMove() {
        lastOverlayLeft += (left - lastOverlayLeft) * 0.35;
        lastOverlayTop += (top - lastOverlayTop) * 0.35;
        d3.select("#dashboard-overlay")
          .style("left", `${lastOverlayLeft}px`)
          .style("top", `${lastOverlayTop}px`);
        if (
          Math.abs(lastOverlayLeft - left) > 1 ||
          Math.abs(lastOverlayTop - top) > 1
        ) {
          overlayMoveAnimation = requestAnimationFrame(animateMove);
        } else {
          d3.select("#dashboard-overlay")
            .style("left", `${left}px`)
            .style("top", `${top}px`);
        }
      }
      if (isNaN(lastOverlayLeft) || isNaN(lastOverlayTop)) {
        lastOverlayLeft = left;
        lastOverlayTop = top;
        d3.select("#dashboard-overlay")
          .style("left", `${left}px`)
          .style("top", `${top}px`);
      } else {
        animateMove();
      }
    }
    function hideOverlayAboveRect() {
      d3.select("#dashboard-overlay")
        .transition()
        .duration(120)
        .style("opacity", 0)
        .on("end", function () {
          d3.select(this).style("display", "none");
        });
    }
    // Hide overlay only when mouse leaves the chart area
    d3.select("#bible-chart").on("mouseleave", function () {
      // This timeout is no longer needed as overlay follows mouse
      // overlayHideTimeout = setTimeout(hideOverlaySmooth, 200);
    });
    d3.select("#bible-chart").on("mouseenter", function () {
      // clearTimeout(overlayHideTimeout);
    });

    // D3 rendering for horizontal arc diagram (bars per chapter, thin bars, arcs above)
    // Remove vertical centering: draw from the top
    const chartGroup = svg
      .append("g")
      .attr("class", "zoom-group")
      .attr("clip-path", "url(#main-clip)")
      .attr("transform", `translate(0,0)`); // No vertical centering

    // Debug logs
    console.log("SVG height:", height);
    console.log("barY (bars start):", barY);
    console.log("arcBaseY (arcs start):", arcBaseY);

    // Add zoom in/out (scale only, no pan), centered on the middle of the SVG
    svg.call(
      d3
        .zoom()
        .scaleExtent([0.5, 8])
        .on("zoom", (event) => {
          const t = event.transform;
          // Center scaling on the middle of the SVG
          const centerX = width / 2;
          const centerY = height / 2;
          chartGroup.attr(
            "transform",
            `translate(${centerX},${centerY}) scale(${t.k}) translate(${-centerX},${-centerY + initialY})`,
          );
        }),
    );

    // Draw chapter rects (bars) - bars point downward from the top
    chartGroup
      .append("g")
      .selectAll("rect")
      .data(chapters)
      .join("rect")
      .attr("class", (d) => "b" + d.book.toLowerCase().replace(/\s+/g, ""))
      .attr("x", (d, i) => x(i))
      .attr("y", barY)
      .attr("width", barWidth)
      .attr("height", (d) => yBar(d.wordCount))
      .attr("fill", (d) =>
        selectedBook && String(d.bookId) === String(selectedBook)
          ? "#ffe082"
          : "#1D84B2",
      )
      .attr("stroke", (d) =>
        selectedBook && String(d.bookId) === String(selectedBook)
          ? "#ffb300"
          : "#bbb",
      )
      .attr("cursor", "pointer")
      .on("mousemove", function (event, d) {
        d3.select(this).attr("fill", "#b3e5fc");
        // Get rect position in viewport
        const rect = this.getBoundingClientRect();
        showOverlayAboveRect(
          `<div style='font-size:1.08rem;font-weight:700;margin-bottom:0.2rem;'>${d.section ? d.section + " - " : ""}${d.book} - Chapter ${d.chapterNum}</div><div style='font-size:0.92rem;opacity:0.8;'>${d.verseCount} verses, ${d.wordCount || 0} words, ${d.charCount || 0} characters</div>`,
          rect.left + window.scrollX,
          rect.top + window.scrollY,
          rect.width,
        );
      })
      .on("mouseleave", function (event, d) {
        d3.select(this).attr(
          "fill",
          selectedBook && String(d.bookId) === String(selectedBook)
            ? "#ffe082"
            : "#1D84B2",
        );
        hideOverlayAboveRect();
      });

    // Draw arcs (above bars, per chapter, elliptical style like flare.js, always above rects)
    const arcGroup = chartGroup
      .append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.85)
      .attr("stroke-width", 3.5)
      .attr("filter", "url(#arc-shadow)");

    console.log("Drawing", arcLinks.length, "arcs");

    arcGroup
      .selectAll("path")
      .data(arcLinks)
      .join("path")
      .attr("stroke", (d, i) => getArcColor(color, d.source, d.target))
      .attr("d", (d) => {
        const x1 = x(d.source) + barWidth / 2;
        const x2 = x(d.target) + barWidth / 2;
        const r = Math.abs(x2 - x1) / 2;
        const largeArcFlag = Math.abs(x2 - x1) > width / 2 ? 1 : 0;
        // Use arcBaseY for both endpoints so arcs are always above bars
        return `M${x1},${arcBaseY} A${r},${r} 0 ${largeArcFlag},0 ${x2},${arcBaseY}`;
      })
      .attr("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-width", 6);
        // Show only the paradox description in the tooltip
        const x1 = x(d.source) + barWidth / 2;
        const x2 = x(d.target) + barWidth / 2;
        const arcMidX = (x1 + x2) / 2;
        showOverlayAboveRect(
          `<div style='font-size:1.08rem;font-weight:700;'>${d.desc || d.group || "Paradox"}</div>`,
          arcMidX,
          arcBaseY - 30,
          180,
        );
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-width", 3.5);
        hideOverlayAboveRect();
      })
      .on("click", function (event, d) {
        const linkedChapters = flatRefs(d.refs);
        setClickedArcChapters(linkedChapters);
        event.stopPropagation();
      });

    // Clear chapters when clicking outside the chart
    d3.select("body").on("click.dashboard-clear", function (event) {
      if (!event.target.closest("#bible-chart")) {
        setClickedArcChapters([]);
      }
    });

    return () => {};
  }, [filteredParadoxes, color, books, selectedBook, chapters, translation]);

  // Pie chart for books in Old vs New Testament
  useEffect(() => {
    if (!books.length) return;
    // Count books by section
    const sectionCounts = books.reduce((acc, book) => {
      const section = (book.section || "").toLowerCase().includes("old")
        ? "Old Testament"
        : "New Testament";
      acc[section] = (acc[section] || 0) + 1;
      return acc;
    }, {});
    const pieData = Object.entries(sectionCounts).map(([section, count]) => ({
      section,
      count,
    }));
    // D3 pie chart
    const pieWidth = 240,
      pieHeight = 240,
      radius = 100;
    d3.select("#pie-chart").selectAll("*").remove();
    const svg = d3
      .select("#pie-chart")
      .attr("width", pieWidth)
      .attr("height", pieHeight)
      .append("g")
      .attr("transform", `translate(${pieWidth / 2},${pieHeight / 2})`);
    const color = d3
      .scaleOrdinal()
      .domain(pieData.map((d) => d.section))
      .range(["#1D84B2", "#ffb300"]);
    const pie = d3.pie().value((d) => d.count);
    const arc = d3.arc().innerRadius(40).outerRadius(radius);
    svg
      .selectAll("path")
      .data(pie(pieData))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.section))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
    // Add legend
    const legend = d3.select("#pie-legend").selectAll("div").data(pieData);
    legend
      .enter()
      .append("div")
      .merge(legend)
      .attr("class", "pie-legend-item")
      .html(
        (d) =>
          `<span style='display:inline-block;width:16px;height:16px;background:${color(d.section)};border-radius:3px;margin-right:8px;'></span>${d.section}: <b>${d.count}</b>`,
      );
    legend.exit().remove();
  }, [books]);

  // Treemap for Book/Chapter/Verse Hierarchy (by book, sized by word count)
  useEffect(() => {
    if (!books.length) return;
    // Prepare data for treemap: one node per book, value = word_count
    const root = d3
      .hierarchy({ children: books }, (d) => d.children)
      .sum((d) => d.word_count || 0)
      .sort((a, b) => b.value - a.value);
    const treemapLayout = d3.treemap().size([240, 240]).padding(2);
    treemapLayout(root);
    d3.select("#treemap-chart").selectAll("*").remove();
    const svg = d3
      .select("#treemap-chart")
      .attr("width", 240)
      .attr("height", 240);
    const color = d3
      .scaleOrdinal()
      .domain(["Old Testament", "New Testament"])
      .range(["#1D84B2", "#ffb300"]);
    const g = svg.append("g");
    g.selectAll("rect")
      .data(root.leaves())
      .join("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) =>
        color(
          (d.data.section || "").toLowerCase().includes("old")
            ? "Old Testament"
            : "New Testament",
        ),
      )
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "#b3e5fc");
        d3.select("#treemap-tooltip")
          .style("display", "block")
          .style("left", `${event.clientX + 10}px`)
          .style("top", `${event.clientY - 20}px`)
          .html(
            `<b>${d.data.section ? d.data.section + " - " : ""}${d.data.short_name}</b><br/>${d.value} words`,
          );
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr(
          "fill",
          color(
            (d.data.section || "").toLowerCase().includes("old")
              ? "Old Testament"
              : "New Testament",
          ),
        );
        d3.select("#treemap-tooltip").style("display", "none");
      });
  }, [books]);

  return (
    <div
      className="dashboard-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        minHeight: "100vh",
      }}
    >
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div
        className="card"
        style={{ margin: "0 auto", maxWidth: 1100, marginBottom: 32 }}
      >
        <div
          className="card-header"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "flex-start",
            alignItems: "center",
            padding: 16,
          }}
        >
          <div className="form-group">
            <select
              className="form-control"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
            >
              {translations.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select
              className="form-control book-select"
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
            >
              <option value="">All Books</option>
              {Array.isArray(books) &&
                books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.short_name}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <select
              className="form-control type-select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ backgroundColor: "salmon" }}
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Subjects" : s}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <select
              className="form-control"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            >
              {COLORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div
          id="bible-chart"
          className="card-body d-flex justify-content-center position-relative"
          style={{
            minHeight: 420,
            maxHeight: 420,
            overflow: "hidden",
            background: "#fafbfc",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <svg
            ref={arcSvgRef}
            style={{
              width: Math.max(mediumWidth, chapters.length * 20),
              height: mediumHeight,
              maxWidth: "100%",
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 8,
              maxHeight: 420,
              overflow: "hidden",
            }}
          />
        </div>
      </div>
      <div
        style={{
          minHeight: 32,
          margin: "0 auto",
          maxWidth: 1100,
          textAlign: "center",
          fontSize: 15,
          color: "#444",
          marginTop: 12,
        }}
      >
        {clickedArcChapters.length > 0 && (
          <span>Linked chapters: {clickedArcChapters.join(", ")}</span>
        )}
      </div>
      {/* Pie chart and Treemap for books in Old vs New Testament */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 32,
          margin: "32px 0 0 0",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            padding: 24,
            width: 280,
            minWidth: 240,
            maxWidth: 280,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
            Books in Old vs New Testament
          </div>
          <svg id="pie-chart" />
          <div
            id="pie-legend"
            style={{
              marginTop: 8,
              fontSize: 15,
              display: "flex",
              gap: 18,
              justifyContent: "center",
            }}
          ></div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            padding: 24,
            width: 280,
            minWidth: 240,
            maxWidth: 280,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
            Book Size Treemap (by words)
          </div>
          <svg id="treemap-chart" />
          <div
            id="treemap-tooltip"
            style={{
              display: "none",
              position: "fixed",
              pointerEvents: "none",
              background: "rgba(40,40,40,0.97)",
              color: "#fff",
              padding: "7px 12px",
              borderRadius: 8,
              fontSize: 14,
              zIndex: 9999,
              boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
            }}
          ></div>
        </div>
      </div>
      <style>{`
        .d3-tooltip {
          font-size: 1rem;
          z-index: 1000;
        }
        .form-control, .book-select, .type-select {
          min-width: 180px;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-size: 1rem;
        }
        .card { box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
      `}</style>
    </div>
  );
};

export default Flare;
