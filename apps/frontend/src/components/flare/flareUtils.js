import * as d3 from "d3";

export function getArcColor(color, start, end) {
  if (color === "Blue") return "#1D84B2";
  if (color === "Purple") return "#6e4b91";
  if (color === "Black") return "#444";
  if (color === "Rainbow") {
    const distance = Math.abs(end - start);
    return d3.hsl((distance / 1189) * 360, 0.7, 0.35);
  }
  return "#1D84B2";
}

export function normalizeRef(ref) {
  return (ref || "")
    .replace(/([a-zA-Z])([0-9])/g, "$1 $2")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function extractBookAndChapter(ref) {
  // More robust regex pattern similar to the old implementation
  const parts = /^(\d?\s?[a-z]+)[\s.:]*(\d*):?(\d*)[-]?(\d*)/i.exec(ref);
  if (parts && parts[1] && parts[2]) {
    const result = `${parts[1].replace(/\s+/g, " ").trim()} ${parts[2]}`;
    return result;
  }
  const match = (ref || "").match(/^([1-3]?\s*[A-Za-z ]+)\s+(\d+):/);
  if (match) {
    const result = `${match[1].replace(/\s+/g, " ").trim()} ${match[2]}`;
    return result;
  }
  const match2 = (ref || "").match(/^([1-3]?\s*[A-Za-z ]+)\s+(\d+)/);
  if (match2) {
    const result = `${match2[1].replace(/\s+/g, " ").trim()} ${match2[2]}`;
    return result;
  }
  const match3 = (ref || "").match(/^([1-3]?\s*[A-Za-z]+)(\d+):/);
  if (match3) {
    const result = `${match3[1].replace(/\s+/g, " ").trim()} ${match3[2]}`;
    return result;
  }
  // Try to match "Genesis2" (no space)
  const match4 = (ref || "").match(/^([1-3]?\s*[A-Za-z]+)(\d+)/);
  if (match4) {
    const result = `${match4[1].replace(/\s+/g, " ").trim()} ${match4[2]}`;
    return result;
  }
  return null;
}

export function getAbsoluteChapterIndex(ref, chapters) {
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
  return chapterIndex >= 0 ? chapterIndex : null;
}

export function flatRefs(refs) {
  if (Array.isArray(refs)) {
    return refs;
  } else if (typeof refs === "object" && refs !== null) {
    // This is an object with more info, so let's pull out all the refs
    const refList = [];
    const keys = Object.keys(refs);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = refs[key];
      if (Array.isArray(value)) {
        for (let j = 0; j < value.length; j++) {
          refList.push(value[j]);
        }
      }
    }
    return refList;
  }
  return [];
}
