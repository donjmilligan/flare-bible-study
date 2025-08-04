import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
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
  const match = (ref || "").match(/^([1-3]?\s*[A-Za-z ]+)\s+(\d+):/);
  if (match) {
    return `${match[1].replace(/\s+/g, " ").trim()} ${match[2]}`;
  }
  const match2 = (ref || "").match(/^([1-3]?\s*[A-Za-z ]+)\s+(\d+)/);
  if (match2) {
    return `${match2[1].replace(/\s+/g, " ").trim()} ${match2[2]}`;
  }
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
    console.log("flatRefs: Processing object with keys:", keys);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = refs[key];
      console.log(`flatRefs: Processing key "${key}" with value:`, value);
      if (Array.isArray(value)) {
        for (let j = 0; j < value.length; j++) {
          refList.push(value[j]);
        }
      }
    }
    console.log("flatRefs: Final flattened refs:", refList);
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
  const [selectedArcInfo, setSelectedArcInfo] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [textSize, setTextSize] = useState(12);
  const mediumWidth = 900;
  const mediumHeight = 400;

  // Zoom control functions - same as OldTestamentJesus1
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleTextSize = useCallback((event) => {
    const change = event.detail;
    setTextSize((prev) => Math.max(8, Math.min(prev + change, 20)));
  }, []);

  // Event listeners for zoom and text size (same as OldTestamentJesus1)
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
                let chapterNum = 1;
                if (ch.name) {
                  const match = ch.name.match(/Chapter\s+(\d+)/i);
                  if (match) {
                    chapterNum = parseInt(match[1]);
                  } else {
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

  // Set default Sabbath selection when paradoxes are loaded
  useEffect(() => {
    if (paradoxes.length > 0 && !selectedArcInfo) {
      const sabbathParadox = paradoxes.find((p) =>
        (p.description || p.desc || "").toLowerCase().includes("sabbath"),
      );

      if (sabbathParadox) {
        const sabbathRefs = flatRefs(sabbathParadox.refs);
        setClickedArcChapters(sabbathRefs);
        setSelectedArcInfo({
          description:
            sabbathParadox.description ||
            sabbathParadox.desc ||
            "The Seventh Day Sabbath",
          chapters: sabbathRefs,
          paradoxId: sabbathParadox.id || "sabbath",
        });
      }
    }
  }, [paradoxes, selectedArcInfo]);

  useEffect(() => {
    fetch(`${API_BASE}/paradoxes`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Raw paradoxes data from API:", data);
        if (Array.isArray(data) && data.length > 0) {
          const processedData = data.map((paradox) => {
            if (typeof paradox.refs === "string") {
              try {
                paradox.refs = JSON.parse(paradox.refs);
              } catch (e) {
                console.error("Failed to parse refs for paradox:", paradox);
              }
            }
            if (typeof paradox.refs === "object" && paradox.refs !== null) {
              console.log("Paradox refs structure:", paradox.refs);
            }
            return paradox;
          });
          console.log("Processed paradoxes data:", processedData);
          setParadoxes(processedData);
        } else {
          console.log("No paradoxes from API, using sample data for testing");
        }
      })
      .catch((err) => {
        console.error("Error fetching paradoxes:", err);
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

    // Prepare arc data (between chapters based on paradoxes)
    const arcLinks = [];
    filteredParadoxes.forEach((par, pi) => {
      // Use the improved flatRefs function to handle both array and object structures
      const refs = flatRefs(par.refs);

      // Get absolute chapter indices for all references in this paradox
      const chapterIndices = refs
        .map((ref) => {
          const extracted = extractBookAndChapter(ref);
          const index = getAbsoluteChapterIndex(ref, chapters);
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
      const sortedChapters = uniqueChapterIndexes.sort((a, b) => a - b);

      // Create a chain of connections: connect each chapter to the next one
      for (let i = 0; i < sortedChapters.length - 1; i++) {
        const start = sortedChapters[i];
        const end = sortedChapters[i + 1];

        arcLinks.push({
          source: start,
          target: end,
          desc: par.description || par.desc,
          group: par.group_name,
          refs: refs,
          paradoxId: par.id || pi,
          startVerse: refs[i] || "",
          endVerse: refs[i + 1] || "",
        });
      }
      if (sortedChapters.length > 2) {
        const first = sortedChapters[0];
        const last = sortedChapters[sortedChapters.length - 1];

        arcLinks.push({
          source: first,
          target: last,
          desc: par.description || par.desc,
          group: par.group_name,
          refs: refs,
          paradoxId: par.id || pi,
          startVerse: refs[0] || "",
          endVerse: refs[refs.length - 1] || "",
        });
      }
    });

    console.log("Final arcLinks:", arcLinks);

    // DEBUG: Check for Sabbath paradox at the end
    console.log("=== SABBATH PARADOX DEBUG ===");
    const sabbathParadox = filteredParadoxes.find((p) =>
      (p.description || p.desc || "").toLowerCase().includes("sabbath"),
    );
    if (sabbathParadox) {
      console.log(
        "Sabbath paradox found:",
        sabbathParadox.description || sabbathParadox.desc,
      );
      const sabbathRefs = flatRefs(sabbathParadox.refs);
      console.log("Sabbath refs:", sabbathRefs);
      console.log(
        "Has Revelation 1:9:",
        sabbathRefs.some((ref) => ref.includes("Revelation 1:9")),
      );
      console.log(
        "Has Genesis 2:1:",
        sabbathRefs.some((ref) => ref.includes("Genesis 2:1")),
      );
      console.log("Total Sabbath refs:", sabbathRefs.length);

      // Check specific chapter indices
      const revelationIndex = getAbsoluteChapterIndex(
        "Revelation 1:9-10",
        chapters,
      );
      const genesisIndex = getAbsoluteChapterIndex("Genesis 2:1-3", chapters);
      console.log("Revelation 1 chapter index:", revelationIndex);
      console.log("Genesis 2 chapter index:", genesisIndex);
      console.log(
        "Chapters between them:",
        chapters.slice(genesisIndex, revelationIndex + 1).map((ch) => ch.name),
      );
    } else {
      console.log("No Sabbath paradox found in filtered paradoxes");
    }
    console.log("=== END SABBATH DEBUG ===");

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

    // Get the actual SVG dimensions
    const svgElement = arcSvgRef.current;
    const svgRect = svgElement.getBoundingClientRect();
    const width = svgRect.width || 900;
    const height = svgRect.height || 600;

    const x = d3
      .scaleLinear()
      .domain([0, chapters.length - 1])
      .range([margin.left, width - margin.right]);
    const maxWords = d3.max(chapters, (d) => d.wordCount || 1);
    const yBar = d3.scaleLinear().domain([0, maxWords]).range([0, barHeight]);

    // Bars at the bottom, arcs start above the bars
    const barY = height - margin.bottom - barHeight;
    const arcBaseY = barY; // Position arcs very close to the bars
    const yBase = barY + barHeight;

    const svg = d3
      .select(arcSvgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", [0, 0, width, height]);
    svg.selectAll("*").remove();
    svg.append("defs").append("filter").attr("id", "arc-shadow").html(`
        <feDropShadow dx='0' dy='2' stdDeviation='2' flood-color='#000' flood-opacity='0.18'/>
      `);

    // Overlay for info display (follows mouse with fixed distance)
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
        .style("max-width", "320px")
        .style("height", "40px")
        .style("display", "none")
        .style("align-items", "center")
        .style("z-index", 9999)
        .style("background", "rgba(40,40,40,0.97)")
        .style("color", "#fff")
        .style("padding", "5px 8px")
        .style("border-radius", "10px")
        .style("font-size", "0.6rem")
        .style("box-shadow", "0 2px 12px rgba(0,0,0,0.18)")
        .style("pointer-events", "none")
        .style("transition", "opacity 0.18s");
    }

    // Fixed distance above mouse cursor
    const TOOLTIP_DISTANCE = 30; // pixels above mouse

    function showOverlayAboveMouse(html, mouseX, mouseY, isArc = false) {
      const overlay = d3.select("#dashboard-overlay");
      overlay.style("display", "flex");
      overlay.style("opacity", 1);

      // Apply different styles based on whether it's an arc or chapter tooltip
      if (isArc) {
        // Arc tooltip - smaller, compact style
        overlay
          .style("width", "400px")
          .style("height", "50px")
          .style("font-size", "0.4rem")
          .style("padding", "6px 8px");
      } else {
        // Chapter tooltip - larger, detailed style
        overlay
          .style("width", "800px")
          .style("height", "60px")
          .style("font-size", "0.6rem")
          .style("padding", "8px 12px");
      }

      // Only update the text if it changed
      if (overlay.html() !== html) {
        overlay.html(html);
      }

      // Position tooltip above mouse with left edge aligned
      const overlayNode = overlay.node();
      const overlayWidth = overlayNode.offsetWidth || (isArc ? 180 : 280);
      const overlayHeight = overlayNode.offsetHeight || (isArc ? 40 : 70);

      // Left edge of tooltip aligns with mouse cursor
      const left = mouseX;
      // Tooltip positioned so bottom edge is 30px above mouse cursor
      const top = mouseY - TOOLTIP_DISTANCE - overlayHeight;

      // Apply position immediately for smooth following
      overlay.style("left", `${left}px`).style("top", `${top}px`);
    }
    function hideOverlay() {
      d3.select("#dashboard-overlay")
        .transition()
        .duration(120)
        .style("opacity", 0)
        .on("end", function () {
          d3.select(this).style("display", "none");
        });
    }
    d3.select("#bible-chart").on("mouseleave", function () {});
    d3.select("#bible-chart").on("mouseenter", function () {
      // clearTimeout(overlayHideTimeout);
    });
    const chartGroup = svg
      .append("g")
      // .attr("clip-path", "url(#main-clip)") // Remove clip path to prevent clipping
      .attr("transform", `translate(0,0)`); // No vertical centering

    // Debug logs
    console.log("SVG height:", height);
    console.log("barY (bars start):", barY);
    console.log("arcBaseY (arcs start):", arcBaseY);
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
        showOverlayAboveMouse(
          `<div style='font-size:1.08rem;font-weight:700;margin-bottom:0.2rem;'>${d.section ? d.section + " - " : ""}${d.book} - Chapter ${d.chapterNum}</div><div style='font-size:0.92rem;opacity:0.8;'>${d.verseCount} verses, ${d.wordCount || 0} words, ${d.charCount || 0} characters</div>`,
          event.clientX,
          event.clientY,
          false, // Chapter tooltip
        );
      })
      .on("mouseleave", function (event, d) {
        d3.select(this).attr(
          "fill",
          selectedBook && String(d.bookId) === String(selectedBook)
            ? "#ffe082"
            : "#1D84B2",
        );
        hideOverlay();
      })
      .on("click", function (event, d) {
        // Convert book name to BibleHub format
        let bookName = d.book.toLowerCase().replace(/\s+/g, "_");
        const chapterNum = d.chapterNum;

        // Handle special cases for BibleHub URL format
        const bookNameMap = {
          "1_kings": "1_kings",
          "2_kings": "2_kings",
          "1_samuel": "1_samuel",
          "2_samuel": "2_samuel",
          "1_chronicles": "1_chronicles",
          "2_chronicles": "2_chronicles",
          "1_corinthians": "1_corinthians",
          "2_corinthians": "2_corinthians",
          "1_thessalonians": "1_thessalonians",
          "2_thessalonians": "2_thessalonians",
          "1_timothy": "1_timothy",
          "2_timothy": "2_timothy",
          "1_peter": "1_peter",
          "2_peter": "2_peter",
          "1_john": "1_john",
          "2_john": "2_john",
          "3_john": "3_john",
          song_of_solomon: "song_of_solomon",
          song_of_songs: "song_of_solomon",
        };

        // Use mapped name if available, otherwise use the converted name
        const finalBookName = bookNameMap[bookName] || bookName;

        // Create BibleHub URL
        const bibleHubUrl = `https://biblehub.com/kjv/${finalBookName}/${chapterNum}.htm`;

        // Open in new tab
        window.open(bibleHubUrl, "_blank");

        event.stopPropagation();
      });

    // Draw arcs (above bars, per chapter, elliptical style like flare.js, always above rects)
    const arcGroup = chartGroup
      .append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.85)
      .attr("stroke-width", 2)
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
        const distance = Math.abs(x2 - x1);

        // Create balanced oval arcs - not too extreme
        const radiusX = Math.min(distance / 2, 25); // Horizontal radius
        const radiusY = Math.min(distance / 2.5, 19); // Vertical radius - slightly smaller for oval shape

        const y1 = arcBaseY;
        const y2 = arcBaseY;

        // Use elliptical arc with different x and y radii for oval shape
        const largeArcFlag = 0; // Always 0 for semicircle
        const sweepFlag = 1; // Always 1 for upward arc

        // Create oval arc using elliptical arc command
        return `M${x1},${y1} A${radiusX},${radiusY} 0 ${largeArcFlag},${sweepFlag} ${x2},${y2}`;
      })
      .attr("cursor", "pointer")
      .on("mouseover", function (event, d) {
        // Change color of all arcs in the same paradox
        arcGroup.selectAll("path").each(function (arcData) {
          if (arcData.paradoxId === d.paradoxId) {
            d3.select(this)
              .attr("stroke", "#ff6b35") // Orange color for hover
              .attr("stroke-width", 3);
          }
        });

        // Show only the paradox description in the tooltip
        showOverlayAboveMouse(
          `<div style='font-size:1.08rem;font-weight:700;'>${d.desc || d.group || "Paradox"}</div>`,
          event.clientX,
          event.clientY,
          true, // Arc tooltip
        );
      })
      .on("mouseout", function () {
        // Reset all arcs to their original colors
        arcGroup.selectAll("path").each(function (arcData) {
          d3.select(this)
            .attr("stroke", getArcColor(color, arcData.source, arcData.target))
            .attr("stroke-width", 2);
        });
        hideOverlay();
      })
      .on("click", function (event, d) {
        const linkedChapters = flatRefs(d.refs);
        setClickedArcChapters(linkedChapters);
        setSelectedArcInfo({
          description: d.desc || d.group || "Paradox",
          chapters: linkedChapters,
          paradoxId: d.paradoxId,
        });
        event.stopPropagation();
      });

    // Clear chapters when clicking outside the chart
    d3.select("body").on("click.dashboard-clear", function (event) {
      if (!event.target.closest("#bible-chart")) {
        // Don't clear the selection - keep the current selection visible
        // setClickedArcChapters([]);
        // setSelectedArcInfo(null);
      }
    });

    return () => {};
  }, [filteredParadoxes, color, books, selectedBook, chapters, translation]);

  // Separate effect for zoom changes - apply to entire SVG like OldTestamentJesus1
  useLayoutEffect(() => {
    if (!arcSvgRef.current) return;

    requestAnimationFrame(() => {
      const svg = d3.select(arcSvgRef.current);
      svg.style("transform", `scale(${zoomLevel})`);
    });
  }, [zoomLevel]);

  // Separate effect for text size changes
  useLayoutEffect(() => {
    if (!arcSvgRef.current) return;

    requestAnimationFrame(() => {
      const svg = d3.select(arcSvgRef.current);
      svg.selectAll("text").style("font-size", `${textSize}px`);
    });
  }, [textSize]);

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

  // Book Distribution Pie Chart
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

    // Clear previous chart
    d3.select("#book-distribution-chart").selectAll("*").remove();

    const width = 300;
    const height = 200;
    const radius = Math.min(width, height) / 2 - 20;

    const svg = d3
      .select("#book-distribution-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3
      .scaleOrdinal()
      .domain(pieData.map((d) => d.section))
      .range(["#1D84B2", "#ffb300"]);

    const pie = d3.pie().value((d) => d.count);
    const arc = d3.arc().innerRadius(30).outerRadius(radius);

    // Draw pie slices
    svg
      .selectAll("path")
      .data(pie(pieData))
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.section))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-width", 3).attr("stroke", "#333");
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke-width", 2).attr("stroke", "#fff");
      });

    // Add labels
    svg
      .selectAll("text")
      .data(pie(pieData))
      .join("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#fff")
      .text((d) => `${d.data.section}\n${d.data.count} books`);
  }, [books]);

  // Chapter Word Count Bar Chart
  useEffect(() => {
    if (!chapters.length) return;

    // Get top 10 chapters by word count
    const topChapters = [...chapters]
      .sort((a, b) => (b.wordCount || 0) - (a.wordCount || 0))
      .slice(0, 10);

    // Clear previous chart
    d3.select("#word-count-chart").selectAll("*").remove();

    const width = 350;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };

    const svg = d3
      .select("#word-count-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scaleBand()
      .domain(topChapters.map((d, i) => `${d.book} ${d.chapterNum}`))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(topChapters, (d) => d.wordCount || 0)])
      .range([height - margin.bottom, margin.top]);

    // Add bars
    svg
      .selectAll("rect")
      .data(topChapters)
      .join("rect")
      .attr("x", (d) => x(`${d.book} ${d.chapterNum}`))
      .attr("y", (d) => y(d.wordCount || 0))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - margin.bottom - y(d.wordCount || 0))
      .attr("fill", "#1D84B2")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "#ffb300");
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("fill", "#1D84B2");
      });

    // Add x-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "10px")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end");

    // Add y-axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "10px");
  }, [chapters]);

  // Paradox Distribution Chart
  useEffect(() => {
    if (!paradoxes.length) return;

    // Group paradoxes by subject/keyword
    const subjectGroups = {};
    paradoxes.forEach((paradox) => {
      const desc = (paradox.description || paradox.desc || "").toLowerCase();
      let subject = "Other";

      if (desc.includes("sabbath")) subject = "Sabbath";
      else if (desc.includes("jesus") || desc.includes("christ"))
        subject = "Jesus";
      else if (desc.includes("god")) subject = "God";
      else if (desc.includes("love")) subject = "Love";
      else if (desc.includes("faith")) subject = "Faith";
      else if (desc.includes("grace")) subject = "Grace";
      else if (desc.includes("works")) subject = "Works";
      else if (desc.includes("dead") || desc.includes("death"))
        subject = "State of the Dead";
      else if (desc.includes("paradox")) subject = "Paradoxes";

      subjectGroups[subject] = (subjectGroups[subject] || 0) + 1;
    });

    const chartData = Object.entries(subjectGroups).map(([subject, count]) => ({
      subject,
      count,
    }));

    // Clear previous chart
    d3.select("#paradox-distribution-chart").selectAll("*").remove();

    const width = 350;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 80 };

    const svg = d3
      .select("#paradox-distribution-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const y = d3
      .scaleBand()
      .domain(chartData.map((d) => d.subject))
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.count)])
      .range([margin.left, width - margin.right]);

    // Add bars
    svg
      .selectAll("rect")
      .data(chartData)
      .join("rect")
      .attr("x", margin.left)
      .attr("y", (d) => y(d.subject))
      .attr("width", (d) => x(d.count) - margin.left)
      .attr("height", y.bandwidth())
      .attr("fill", "#6e4b91")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "#ff6b35");
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("fill", "#6e4b91");
      });

    // Add x-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "10px");

    // Add y-axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "10px");
  }, [paradoxes]);

  // Translation Comparison Chart
  useEffect(() => {
    // Clear previous chart
    d3.select("#translation-chart").selectAll("*").remove();

    const width = 350;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 80 };

    const svg = d3
      .select("#translation-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const y = d3
      .scaleBand()
      .domain(TRANSLATIONS.map((t) => t.label))
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    const x = d3
      .scaleLinear()
      .domain([0, TRANSLATIONS.length])
      .range([margin.left, width - margin.right]);

    // Add bars for each translation
    svg
      .selectAll("rect")
      .data(TRANSLATIONS)
      .join("rect")
      .attr("x", margin.left)
      .attr("y", (d, i) => y(d.label))
      .attr("width", (d, i) => x(i + 1) - margin.left)
      .attr("height", y.bandwidth())
      .attr("fill", (d, i) => (d.value === translation ? "#ffb300" : "#1D84B2"))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "#ff6b35");
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr(
          "fill",
          d.value === translation ? "#ffb300" : "#1D84B2",
        );
      });

    // Add y-axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "9px");

    // Add current translation indicator
    svg
      .append("text")
      .attr("x", width - margin.right)
      .attr("y", margin.top)
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#ffb300")
      .text("Current");
  }, [translation]);

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
        style={{
          margin: "0 auto",
          maxWidth: 1100,
          display: "flex",
          flexDirection: "column",
          minHeight: "80vh",
        }}
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
            flex: 1,
            minHeight: 500,
            overflow: "visible",
            background: "#fff",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            padding: 0,
          }}
        >
          <svg
            ref={arcSvgRef}
            style={{
              width: "100%",
              height: "100%",
              maxWidth: "100%",
              background: "#fff",
              display: "block",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </div>
      </div>
      {(() => {
        // Always show Sabbath if no selection, or show selected arc info
        if (selectedArcInfo) {
          return selectedArcInfo;
        } else if (paradoxes.length > 0) {
          const sabbathParadox = paradoxes.find((p) =>
            (p.description || p.desc || "").toLowerCase().includes("sabbath"),
          );
          if (sabbathParadox) {
            const sabbathRefs = flatRefs(sabbathParadox.refs);
            return {
              description:
                sabbathParadox.description ||
                sabbathParadox.desc ||
                "The Seventh Day Sabbath",
              chapters: sabbathRefs,
              paradoxId: sabbathParadox.id || "sabbath",
            };
          }
        }
        return null;
      })() && (
        <div
          style={{
            minHeight: 120,
            margin: "20px auto",
            padding: "20px",
            width: "100%",
            background: "#fff",
            borderRadius: "5px",
            border: "1px solid #e9ecef",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            <h3
              style={{
                fontSize: "18px",
                color: "#333",
                margin: "0 0 10px 0",
                fontWeight: "600",
              }}
            >
              Selected Paradox:{" "}
              {(() => {
                // Always show Sabbath if no selection, or show selected arc info
                if (selectedArcInfo) {
                  return selectedArcInfo.description;
                } else if (paradoxes.length > 0) {
                  const sabbathParadox = paradoxes.find((p) =>
                    (p.description || p.desc || "")
                      .toLowerCase()
                      .includes("sabbath"),
                  );
                  if (sabbathParadox) {
                    return (
                      sabbathParadox.description ||
                      sabbathParadox.desc ||
                      "The Seventh Day Sabbath"
                    );
                  }
                }
                return "";
              })()}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                margin: "0",
                fontStyle: "italic",
              }}
            >
              Click any arc above to view different chapters
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center",
              padding: "10px",
            }}
          >
            {(() => {
              // Always show Sabbath if no selection, or show selected arc info
              if (selectedArcInfo) {
                return selectedArcInfo.chapters;
              } else if (paradoxes.length > 0) {
                const sabbathParadox = paradoxes.find((p) =>
                  (p.description || p.desc || "")
                    .toLowerCase()
                    .includes("sabbath"),
                );
                if (sabbathParadox) {
                  return flatRefs(sabbathParadox.refs);
                }
              }
              return [];
            })().map((chapter, index) => (
              <span
                key={index}
                style={{
                  background: "#1D84B2",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "500",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              >
                {chapter}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Tips and Information Grid */}
      <div
        style={{
          margin: "20px auto",
          padding: "20px",
          width: "100%",
          maxWidth: "1100px",
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #e9ecef",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            color: "#333",
            margin: "0 0 20px 0",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Bible Study Insights & Statistics
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {/* Left Column */}
          <div
            style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
            }}
          >
            <h4
              style={{
                fontSize: "16px",
                color: "#1D84B2",
                margin: "0 0 15px 0",
                fontWeight: "600",
              }}
            >
              📚 Translation & Book Statistics
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Current Translation:</span>
                <span style={{ fontWeight: "600", color: "#333" }}>
                  {TRANSLATION_LABELS[translation] || translation.toUpperCase()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Total Books:</span>
                <span style={{ fontWeight: "600", color: "#333" }}>
                  {books.length}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Total Chapters:</span>
                <span style={{ fontWeight: "600", color: "#333" }}>
                  {chapters.length}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Total Words:</span>
                <span style={{ fontWeight: "600", color: "#333" }}>
                  {chapters
                    .reduce((sum, ch) => sum + (ch.wordCount || 0), 0)
                    .toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Total Characters:</span>
                <span style={{ fontWeight: "600", color: "#333" }}>
                  {chapters
                    .reduce((sum, ch) => sum + (ch.charCount || 0), 0)
                    .toLocaleString()}
                </span>
              </div>
              {selectedBook && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#666" }}>Selected Book:</span>
                  <span style={{ fontWeight: "600", color: "#333" }}>
                    {books.find((b) => String(b.id) === String(selectedBook))
                      ?.short_name || "Unknown"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div
            style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
            }}
          >
            <h4
              style={{
                fontSize: "16px",
                color: "#1D84B2",
                margin: "0 0 15px 0",
                fontWeight: "600",
              }}
            >
              🔍 Paradox Analysis
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Total Paradoxes:</span>
                <span style={{ fontWeight: "600", color: "#333" }}>
                  {paradoxes.length}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Filtered Paradoxes:</span>
                <span style={{ fontWeight: "600", color: "#333" }}>
                  {filteredParadoxes.length}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Current Subject:</span>
                <span style={{ fontWeight: "600", color: "#333" }}>
                  {subject}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666" }}>Arc Color Theme:</span>
                <span style={{ fontWeight: "600", color: "#333" }}>
                  {color}
                </span>
              </div>
              {selectedArcInfo && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#666" }}>Selected Chapters:</span>
                  <span style={{ fontWeight: "600", color: "#333" }}>
                    {selectedArcInfo.chapters.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "8px",
            color: "white",
          }}
        >
          <h4
            style={{
              fontSize: "18px",
              margin: "0 0 15px 0",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            💡 Study Tips & Navigation
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
            >
              <span style={{ fontSize: "20px" }}>🎯</span>
              <div>
                <strong>Click on arcs</strong> to explore different paradoxes
                and their connected chapters
              </div>
            </div>
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
            >
              <span style={{ fontSize: "20px" }}>📖</span>
              <div>
                <strong>Click on chapter bars</strong> to open BibleHub for
                detailed reading
              </div>
            </div>
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
            >
              <span style={{ fontSize: "20px" }}>🔍</span>
              <div>
                <strong>Use filters</strong> to focus on specific books,
                subjects, or translations
              </div>
            </div>
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
            >
              <span style={{ fontSize: "20px" }}>📊</span>
              <div>
                <strong>Hover over elements</strong> to see detailed tooltips
                and statistics
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div
          style={{
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "15px",
          }}
        >
          <div
            style={{
              background: "#e3f2fd",
              padding: "15px",
              borderRadius: "8px",
              textAlign: "center",
              border: "1px solid #bbdefb",
            }}
          >
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#1976d2" }}
            >
              {
                books.filter((b) =>
                  (b.section || "").toLowerCase().includes("old"),
                ).length
              }
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Old Testament Books
            </div>
          </div>
          <div
            style={{
              background: "#fff3e0",
              padding: "15px",
              borderRadius: "8px",
              textAlign: "center",
              border: "1px solid #ffcc80",
            }}
          >
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#f57c00" }}
            >
              {
                books.filter((b) =>
                  (b.section || "").toLowerCase().includes("new"),
                ).length
              }
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              New Testament Books
            </div>
          </div>
          <div
            style={{
              background: "#f3e5f5",
              padding: "15px",
              borderRadius: "8px",
              textAlign: "center",
              border: "1px solid #e1bee7",
            }}
          >
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#7b1fa2" }}
            >
              {chapters
                .reduce((sum, ch) => sum + (ch.verseCount || 0), 0)
                .toLocaleString()}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>Total Verses</div>
          </div>
          <div
            style={{
              background: "#e8f5e8",
              padding: "15px",
              borderRadius: "8px",
              textAlign: "center",
              border: "1px solid #c8e6c9",
            }}
          >
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#388e3c" }}
            >
              {Math.round(
                chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0) /
                  chapters.length,
              ).toLocaleString()}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Avg Words/Chapter
            </div>
          </div>
        </div>
      </div>

      {/* Additional Charts and Visualizations */}
      <div
        style={{
          margin: "20px auto",
          padding: "20px",
          width: "100%",
          maxWidth: "1100px",
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #e9ecef",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            color: "#333",
            margin: "0 0 20px 0",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Bible Data Visualizations
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "25px",
            marginTop: "20px",
          }}
        >
          {/* Book Distribution Pie Chart */}
          <div
            style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
            }}
          >
            <h4
              style={{
                fontSize: "16px",
                color: "#1D84B2",
                margin: "0 0 15px 0",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Book Distribution by Testament
            </h4>
            <div id="book-distribution-chart" style={{ height: "200px" }}></div>
          </div>

          {/* Chapter Word Count Bar Chart */}
          <div
            style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
            }}
          >
            <h4
              style={{
                fontSize: "16px",
                color: "#1D84B2",
                margin: "0 0 15px 0",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Top 10 Chapters by Word Count
            </h4>
            <div id="word-count-chart" style={{ height: "200px" }}></div>
          </div>

          {/* Paradox Distribution Chart */}
          <div
            style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
            }}
          >
            <h4
              style={{
                fontSize: "16px",
                color: "#1D84B2",
                margin: "0 0 15px 0",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Paradox Distribution by Subject
            </h4>
            <div
              id="paradox-distribution-chart"
              style={{ height: "200px" }}
            ></div>
          </div>

          {/* Translation Comparison Chart */}
          <div
            style={{
              background: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
            }}
          >
            <h4
              style={{
                fontSize: "16px",
                color: "#1D84B2",
                margin: "0 0 15px 0",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Available Translations
            </h4>
            <div id="translation-chart" style={{ height: "200px" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flare;
