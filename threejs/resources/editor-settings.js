
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

function fixSourceLinks(url, source) {
  const srcRE = /(src=)"(.*?)"/g;
  const linkRE = /(href=)"(.*?)"/g;
  const imageSrcRE = /((?:image|img)\.src = )"(.*?)"/g;
  const loaderLoadRE = /(loader\.load[a-z]*\s*\(\s*)('|")(.*?)('|")/ig;
  const loaderArrayLoadRE = /(loader\.load[a-z]*\(\[)([\s\S]*?)(\])/ig;
  const loadFileRE = /(loadFile\s*\(\s*)('|")(.*?)('|")/ig;
  const threejsfundamentalsUrlRE = /(.*?)('|")(.*?)('|")(.*?)(\/\*\s+threejsfundamentals:\s+url\s+\*\/)/ig;
  const arrayLineRE = /^(\s*["|'])([\s\S]*?)(["|']*$)/;
  const urlPropRE = /(url:\s*)('|")(.*?)('|")/g;
  const workerRE = /(new\s+Worker\s*\(\s*)('|")(.*?)('|")/g;
  const importScriptsRE = /(importScripts\s*\(\s*)('|")(.*?)('|")/g;
  const prefix = getPrefix(url);

  function addPrefix(url) {
    return url.indexOf('://') < 0 && url[0] !== '?' ? (prefix + url) : url;
  }
  function makeLinkFQed(match, p1, url) {
    return p1 + '"' + addPrefix(url) + '"';
  }
  function makeLinkFDedQuotes(match, fn, q1, url, q2) {
    return fn + q1 + addPrefix(url) + q2;
  }
  function makeTaggedFDedQuotes(match, start, q1, url, q2, suffix) {
    return start + q1 + addPrefix(url) + q2 + suffix;
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

  source = source.replace(srcRE, makeLinkFQed);
  source = source.replace(linkRE, makeLinkFQed);
  source = source.replace(imageSrcRE, makeLinkFQed);
  source = source.replace(urlPropRE, makeLinkFDedQuotes);
  source = source.replace(loadFileRE, makeLinkFDedQuotes);
  source = source.replace(loaderLoadRE, makeLinkFDedQuotes);
  source = source.replace(workerRE, makeLinkFDedQuotes);
  source = source.replace(importScriptsRE, makeLinkFDedQuotes);
  source = source.replace(loaderArrayLoadRE, makeArrayLinksFDed);
  source = source.replace(threejsfundamentalsUrlRE, makeTaggedFDedQuotes);

  return source;
}

function extraHTMLParsing(html /* , htmlParts */) {
  return html;
}

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