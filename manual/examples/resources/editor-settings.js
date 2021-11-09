
(function() {  // eslint-disable-line strict
'use strict';  // eslint-disable-line strict

function dirname(path) {
  const ndx = path.lastIndexOf('/');
  return path.substring(0, ndx + 1);
}

function getPrefix(url) {
  const u = new URL(url, window.location.href);
  const prefix = u.origin + dirname(u.pathname);
  return prefix;
}

/**
 * Fix any local URLs into fully qualified urls.
 *
 * Examples:
 *    resources/image.jpg ->  https://domain.org/webgl/resouces/image.jpg
 *    /3rdparty/lib.js    ->  https://domain.org/3rdparty/lib.js
 *
 * The reason is (a) we're running the code as via blobUrl and nothing is relative to a blob.
 * (b) we can upload to jsfiddle/codepen and so need to link back to the files.
 *
 * This is all kind of hacky in that it's just a bunch of regular expressions looking
 * for matches.
 *
 * @param {string} url The URL of the file source.
 * @param {string} source An HTML file or JavaScript file
 * @returns {string} the source after having urls fixed.
 */
function fixSourceLinks(url, source) {
  const srcRE = /(src=)(")(.*?)(")()/g;
  const linkRE = /(href=)(")(.*?)(")()/g;
  const imageSrcRE = /((?:image|img)\.src = )(")(.*?)(")()/g;
  const loaderLoadRE = /(loader\.load[a-z]*\s*\(\s*)('|")(.*?)('|")/ig;
  const loaderArrayLoadRE = /(loader\.load[a-z]*\(\[)([\s\S]*?)(\])/ig;
  const loadFileRE = /(loadFile\s*\(\s*)('|")(.*?)('|")/ig;
  const threejsfundamentalsUrlRE = /(.*?)('|")([^"']*?)('|")([^'"]*?)(\/\*\s+threejsfundamentals:\s+url\s+\*\/)/ig;
  const arrayLineRE = /^(\s*["|'])([\s\S]*?)(["|']*$)/;
  const urlPropRE = /(url:\s*)('|")(.*?)('|")/g;
  const workerRE = /(new\s+Worker\s*\(\s*)('|")(.*?)('|")/g;
  const importScriptsRE = /(importScripts\s*\(\s*)('|")(.*?)('|")/g;
  const moduleRE = /(import.*?)('|")(.*?)('|")/g;
  const prefix = getPrefix(url);

  function addPrefix(url) {
    return url.indexOf('://') < 0 && !url.startsWith('data:') && url[0] !== '?' ? (prefix + url).replace(/\/.\//g, '/') : url;
  }
  function makeLinkFDedQuotes(match, fn, q1, url, q2) {
    return fn + q1 + addPrefix(url) + q2;
  }
  function makeTaggedFDedQuotes(match, start, q1, url, q2, suffix) {
    return start + q1 + addPrefix(url) + q2 + suffix;
  }
  function makeFDedQuotes(match, start, q1, url, q2) {
    return start + q1 + addPrefix(url) + q2;
  }
  function makeArrayLinksFDed(match, prefix, arrayStr, suffix) {
    const lines = arrayStr.split(',').map((line) => {
      const m = arrayLineRE.exec(line);
      return m
          ? `${m[1]}${addPrefix(m[2])}${m[3]}`
          : line;
    });
    return `${prefix}${lines.join(',')}${suffix}`;
  }

  source = source.replace(srcRE, makeTaggedFDedQuotes);
  source = source.replace(linkRE, makeTaggedFDedQuotes);
  source = source.replace(imageSrcRE, makeTaggedFDedQuotes);
  source = source.replace(urlPropRE, makeLinkFDedQuotes);
  source = source.replace(loadFileRE, makeLinkFDedQuotes);
  source = source.replace(loaderLoadRE, makeLinkFDedQuotes);
  source = source.replace(workerRE, makeLinkFDedQuotes);
  source = source.replace(importScriptsRE, makeLinkFDedQuotes);
  source = source.replace(loaderArrayLoadRE, makeArrayLinksFDed);
  source = source.replace(threejsfundamentalsUrlRE, makeTaggedFDedQuotes);
  source = source.replace(moduleRE, makeFDedQuotes);

  return source;
}

/**
 * Called after parsing to give a change to update htmlParts
 * @param {string} html The main page html turned into a template with the <style>, <script> and <body> parts extracted
 * @param {Object<string, HTMLPart>} htmlParts All the extracted parts
 * @return {string} The modified html template
 */
function extraHTMLParsing(html /* , htmlParts */) {
  return html;
}

/**
 * Change JavaScript before uploading code to JSFiddle/Codepen
 *
 * @param {string} js JavaScript source
 * @returns {string} The JavaScript source with any fixes applied.
 */
function fixJSForCodeSite(js) {
  // not yet needed for three.js
  return js;
}

window.lessonEditorSettings = {
  extraHTMLParsing,
  fixSourceLinks,
  fixJSForCodeSite,
  runOnResize: false,
  lessonSettings: {
    glDebug: false,
  },
  tags: ['three.js', 'threejsfundamentals.org'],
  name: 'threejsfundamentals',
  icon: '/threejs/lessons/resources/threejsfundamentals-icon-256.png',
};

}());