import { regexp as r } from "./ifc-regexp.js";

function solveUnicode(text) {
  if (r.unicode.test(text)) {
    const encoded = text.match(r.unicode)[0].match(r.getUnicode)[0];
    text = text.replace(r.unicode, String.fromCharCode(parseInt(encoded, 16)));
  }
  return text;
}

function formatDate(text) {
  const formatted = new Date(text * 1000);
  return formatted.getTime() ? formatted : text;
}

export { solveUnicode, formatDate };
