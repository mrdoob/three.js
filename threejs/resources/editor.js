(function() {  // eslint-disable-line
'use strict';  // eslint-disable-line

/* global monaco, require */

const lessonHelperScriptRE = /<script src="[^"]+threejs-lessons-helper\.js"><\/script>/;

function getQuery(s) {
  s = s === undefined ? window.location.search : s;
  if (s[0] === '?' ) {
    s = s.substring(1);
  }
  const query = {};
  s.split('&').forEach(function(pair) {
      const parts = pair.split('=').map(decodeURIComponent);
      query[parts[0]] = parts[1];
  });
  return query;
}

function getSearch(url) {
  // yea I know this is not perfect but whatever
  const s = url.indexOf('?');
  return s < 0 ? {} : getQuery(url.substring(s));
}

const getFQUrl = (function() {
  const a = document.createElement('a');
  return function getFQUrl(url) {
    a.href = url;
    return a.href;
  };
}());

function getHTML(url, callback) {
  const req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.addEventListener('load', function() {
    const success = req.status === 200 || req.status === 0;
    callback(success ? null : 'could not load: ' + url, req.responseText);
  });
  req.addEventListener('timeout', function() {
    callback('timeout get: ' + url);
  });
  req.addEventListener('error', function() {
    callback('error getting: ' + url);
  });
  req.send('');
}

function getPrefix(url) {
  const u = new URL(window.location.origin + url);
  const prefix = u.origin + dirname(u.pathname);
  return prefix;
}

function fixSourceLinks(url, source) {
  const srcRE = /(src=)"(.*?)"/g;
  const linkRE = /(href=)"(.*?")/g;
  const imageSrcRE = /((?:image|img)\.src = )"(.*?)"/g;
  const loaderLoadRE = /(loader\.load[a-z]*\s*\(\s*)('|")(.*?)('|")/ig;
  const loaderArrayLoadRE = /(loader\.load[a-z]*\(\[)([\s\S]*?)(\])/ig;
  const loadFileRE = /(loadFile\s*\(\s*)('|")(.*?)('|")/ig;
  const arrayLineRE = /^(\s*["|'])([\s\S]*?)(["|']*$)/;
  const urlPropRE = /(url:\s*)('|")(.*?)('|")/g;
  const prefix = getPrefix(url);

  function addPrefix(url) {
    return url.indexOf('://') < 0 ? (prefix + url) : url;
  }
  function makeLinkFQed(match, p1, url) {
    return p1 + '"' + addPrefix(url) + '"';
  }
  function makeLinkFDedQuotes(match, fn, q1, url, q2) {
    return fn + q1 + addPrefix(url) + q2;
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
  source = source.replace(loaderArrayLoadRE, makeArrayLinksFDed);

  return source;
}

function fixCSSLinks(url, source) {
  const cssUrlRE = /(url\()(.*?)(\))/g;
  const prefix = getPrefix(url);

  function addPrefix(url) {
    return url.indexOf('://') < 0 ? (prefix + url) : url;
  }
  function makeFQ(match, prefix, url, suffix) {
    return `${prefix}${addPrefix(url)}${suffix}`;
  }

  source = source.replace(cssUrlRE, makeFQ);
  return source;
}

const g = {
  html: '',
};

const htmlParts = {
  js: {
    language: 'javascript',
  },
  css: {
    language: 'css',
  },
  html: {
    language: 'html',
  },
};

function forEachHTMLPart(fn) {
  Object.keys(htmlParts).forEach(function(name, ndx) {
    const info = htmlParts[name];
    fn(info, ndx, name);
  });
}


function getHTMLPart(re, obj, tag) {
  let part = '';
  obj.html = obj.html.replace(re, function(p0, p1) {
    part = p1;
    return tag;
  });
  return part.replace(/\s*/, '');
}

function parseHTML(url, html) {
  html = fixSourceLinks(url, html);

  html = html.replace(/<div class="description">[^]*?<\/div>/, '');

  const styleRE = /<style>([^]*?)<\/style>/i;
  const titleRE = /<title>([^]*?)<\/title>/i;
  const bodyRE = /<body>([^]*?)<\/body>/i;
  const inlineScriptRE = /<script>([^]*?)<\/script>/i;
  const externalScriptRE = /(<!--(?:(?!-->)[\s\S])*?-->\n){0,1}<script\s*src\s*=\s*"(.*?)"\s*>\s*<\/script>/ig;
  const dataScriptRE = /(<!--(?:(?!-->)[\s\S])*?-->\n){0,1}<script (.*?)>([^]*?)<\/script>/ig;
  const cssLinkRE = /<link ([^>]+?)>/g;
  const isCSSLinkRE = /type="text\/css"|rel="stylesheet"/;
  const hrefRE = /href="([^"]+)"/;

  const obj = { html: html };
  htmlParts.css.source = fixCSSLinks(url, getHTMLPart(styleRE, obj, '<style>\n${css}</style>'));
  htmlParts.html.source = getHTMLPart(bodyRE, obj, '<body>${html}</body>');
  htmlParts.js.source = getHTMLPart(inlineScriptRE, obj, '<script>${js}</script>');
  html = obj.html;

  const tm = titleRE.exec(html);
  if (tm) {
    g.title = tm[1];
  }

  let scripts = '';
  html = html.replace(externalScriptRE, function(p0, p1, p2) {
    p1 = p1 || '';
    scripts += '\n' + p1 + '<script src="' + p2 + '"></script>';
    return '';
  });

  let dataScripts = '';
  html = html.replace(dataScriptRE, function(p0, p1, p2, p3) {
    p1 = p1 || '';
    dataScripts += '\n' + p1 + '<script ' + p2 + '>' + p3 + '</script>';
    return '';
  });

  htmlParts.html.source += dataScripts;
  htmlParts.html.source += scripts + '\n';

  // add style section if there is non
  if (html.indexOf('${css}') < 0) {
    html = html.replace('</head>', '<style>\n${css}</style>\n</head>');
  }

  // add hackedparams section.
  // We need a way to pass parameters to a blob. Normally they'd be passed as
  // query params but that only works in Firefox >:(
  html = html.replace('</head>', '<script id="hackedparams">window.hackedParams = ${hackedParams}\n</script>\n</head>');

  let links = '';
  html = html.replace(cssLinkRE, function(p0, p1) {
    if (isCSSLinkRE.test(p1)) {
      const m = hrefRE.exec(p1);
      if (m) {
        links += `@import url("${m[1]}");\n`;
      }
      return '';
    } else {
      return p0;
    }
  });

  htmlParts.css.source = links + htmlParts.css.source;

  g.html = html;
}

function cantGetHTML(e) {  // eslint-disable-line
  console.log(e);  // eslint-disable-line
  console.log("TODO: don't run editor if can't get HTML");  // eslint-disable-line
}

function main() {
  const query = getQuery();
  g.url = getFQUrl(query.url);
  g.query = getSearch(g.url);
  getHTML(query.url, function(err, html) {
    if (err) {
      console.log(err);  // eslint-disable-line
      return;
    }
    parseHTML(query.url, html);
    setupEditor(query.url);
    if (query.startPane) {
      const button = document.querySelector('.button-' + query.startPane);
      toggleSourcePane(button);
    }
  });
}


let blobUrl;
function getSourceBlob(htmlParts, options) {
  options = options || {};
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }
  const prefix = dirname(g.url);
  let source = g.html;
  source = source.replace('${hackedParams}', JSON.stringify(g.query));
  source = source.replace('${html}', htmlParts.html);
  source = source.replace('${css}', htmlParts.css);
  source = source.replace('${js}', htmlParts.js);
  source = source.replace('<head>', '<head>\n<script match="false">threejsLessonSettings = ' + JSON.stringify(options) + ';</script>');

  source = source.replace('</head>', '<script src="' + prefix + '/resources/threejs-lessons-helper.js"></script>\n</head>');
  const scriptNdx = source.indexOf('<script>');
  g.numLinesBeforeScript = (source.substring(0, scriptNdx).match(/\n/g) || []).length;

  const blob = new Blob([source], {type: 'text/html'});
  blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}

function getSourceBlobFromEditor(options) {
  return getSourceBlob({
    html: htmlParts.html.editor.getValue(),
    css: htmlParts.css.editor.getValue(),
    js: htmlParts.js.editor.getValue(),
  }, options);
}

function getSourceBlobFromOrig(options) {
  return getSourceBlob({
    html: htmlParts.html.source,
    css: htmlParts.css.source,
    js: htmlParts.js.source,
  }, options);
}

function dirname(path) {
  const ndx = path.lastIndexOf('/');
  return path.substring(0, ndx + 1);
}

function resize() {
  forEachHTMLPart(function(info) {
    info.editor.layout();
  });
}

function addCORSSupport(js) {
  // not yet needed for three.js
  return js;
}

function openInCodepen() {
  const comment = `// ${g.title}
// from ${g.url}

  `;
  const pen = {
    title                 : g.title,
    description           : 'from: ' + g.url,
    tags                  : ['three.js', 'threejsfundamentals.org'],
    editors               : '101',
    html                  : htmlParts.html.editor.getValue().replace(lessonHelperScriptRE, ''),
    css                   : htmlParts.css.editor.getValue(),
    js                    : comment + addCORSSupport(htmlParts.js.editor.getValue()),
  };

  const elem = document.createElement('div');
  elem.innerHTML = `
    <form method="POST" target="_blank" action="https://codepen.io/pen/define" class="hidden">'
      <input type="hidden" name="data">
      <input type="submit" />
    "</form>"
  `;
  elem.querySelector('input[name=data]').value = JSON.stringify(pen);
  window.frameElement.ownerDocument.body.appendChild(elem);
  elem.querySelector('form').submit();
  window.frameElement.ownerDocument.body.removeChild(elem);
}

function openInJSFiddle() {
  const comment = `// ${g.title}
// from ${g.url}

  `;
  // const pen = {
  //   title                 : g.title,
  //   description           : "from: " + g.url,
  //   tags                  : ["three.js", "threejsfundamentals.org"],
  //   editors               : "101",
  //   html                  : htmlParts.html.editor.getValue(),
  //   css                   : htmlParts.css.editor.getValue(),
  //   js                    : comment + htmlParts.js.editor.getValue(),
  // };

  const elem = document.createElement('div');
  elem.innerHTML = `
    <form method="POST" target="_black" action="https://jsfiddle.net/api/mdn/" class="hidden">
      <input type="hidden" name="html" />
      <input type="hidden" name="css" />
      <input type="hidden" name="js" />
      <input type="hidden" name="title" />
      <input type="hidden" name="wrap" value="b" />
      <input type="submit" />
    </form>
  `;
  elem.querySelector('input[name=html]').value = htmlParts.html.editor.getValue().replace(lessonHelperScriptRE, '');
  elem.querySelector('input[name=css]').value = htmlParts.css.editor.getValue();
  elem.querySelector('input[name=js]').value = comment + addCORSSupport(htmlParts.js.editor.getValue());
  elem.querySelector('input[name=title]').value = g.title;
  window.frameElement.ownerDocument.body.appendChild(elem);
  elem.querySelector('form').submit();
  window.frameElement.ownerDocument.body.removeChild(elem);
}

function setupEditor() {

  forEachHTMLPart(function(info, ndx, name) {
    info.parent = document.querySelector('.panes>.' + name);
    info.editor = runEditor(info.parent, info.source, info.language);
    info.button = document.querySelector('.button-' + name);
    info.button.addEventListener('click', function() {
      toggleSourcePane(info.button);
      run();
    });
  });

  g.fullscreen = document.querySelector('.button-fullscreen');
  g.fullscreen.addEventListener('click', toggleFullscreen);

  g.run = document.querySelector('.button-run');
  g.run.addEventListener('click', run);

  g.iframe = document.querySelector('.result>iframe');
  g.other = document.querySelector('.panes .other');

  document.querySelector('.button-codepen').addEventListener('click', openInCodepen);
  document.querySelector('.button-jsfiddle').addEventListener('click', openInJSFiddle);

  g.result = document.querySelector('.panes .result');
  g.resultButton = document.querySelector('.button-result');
  g.resultButton.addEventListener('click', function() {
     toggleResultPane();
     run();
  });
  g.result.style.display = 'none';
  toggleResultPane();

  if (window.innerWidth > 1200) {
    toggleSourcePane(htmlParts.js.button);
  }

  window.addEventListener('resize', resize);

  showOtherIfAllPanesOff();
  document.querySelector('.other .loading').style.display = 'none';

  resize();
  run({glDebug: false});
}

function toggleFullscreen() {
  try {
    toggleIFrameFullscreen(window);
    resize();
    run();
  } catch (e) {
    console.error(e);  // eslint-disable-line
  }
}

function run(options) {
  g.setPosition = false;
  const url = getSourceBlobFromEditor(options);
  g.iframe.src = url;
}

function addClass(elem, className) {
  const parts = elem.className.split(' ');
  if (parts.indexOf(className) < 0) {
    elem.className = elem.className + ' ' + className;
  }
}

function removeClass(elem, className) {
  const parts = elem.className.split(' ');
  const numParts = parts.length;
  for (;;) {
    const ndx = parts.indexOf(className);
    if (ndx < 0) {
      break;
    }
    parts.splice(ndx, 1);
  }
  if (parts.length !== numParts) {
    elem.className = parts.join(' ');
    return true;
  }
  return false;
}

function toggleClass(elem, className) {
  if (removeClass(elem, className)) {
    return false;
  } else {
    addClass(elem, className);
    return true;
  }
}

function toggleIFrameFullscreen(childWindow) {
  const frame = childWindow.frameElement;
  if (frame) {
    const isFullScreen = toggleClass(frame, 'fullscreen');
    frame.ownerDocument.body.style.overflow = isFullScreen ? 'hidden' : '';
  }
}


function addRemoveClass(elem, className, add) {
  if (add) {
    addClass(elem, className);
  } else {
    removeClass(elem, className);
  }
}

function toggleSourcePane(pressedButton) {
  forEachHTMLPart(function(info) {
    const pressed = pressedButton === info.button;
    if (pressed && !info.showing) {
      addClass(info.button, 'show');
      info.parent.style.display = 'block';
      info.showing = true;
    } else {
      removeClass(info.button, 'show');
      info.parent.style.display = 'none';
      info.showing = false;
    }
  });
  showOtherIfAllPanesOff();
  resize();
}

function showingResultPane() {
  return g.result.style.display !== 'none';
}
function toggleResultPane() {
  const showing = showingResultPane();
  g.result.style.display = showing ? 'none' : 'block';
  addRemoveClass(g.resultButton, 'show', !showing);
  showOtherIfAllPanesOff();
  resize();
}

function showOtherIfAllPanesOff() {
  let paneOn = showingResultPane();
  forEachHTMLPart(function(info) {
    paneOn = paneOn || info.showing;
  });
  g.other.style.display = paneOn ? 'none' : 'block';
}

function getActualLineNumberAndMoveTo(lineNo, colNo) {
  const actualLineNo = lineNo - g.numLinesBeforeScript;
  if (!g.setPosition) {
    // Only set the first position
    g.setPosition = true;
    htmlParts.js.editor.setPosition({
      lineNumber: actualLineNo,
      column: colNo,
    });
    htmlParts.js.editor.revealLineInCenterIfOutsideViewport(actualLineNo);
    htmlParts.js.editor.focus();
  }
  return actualLineNo;
}

window.getActualLineNumberAndMoveTo = getActualLineNumberAndMoveTo;

function runEditor(parent, source, language) {
  return monaco.editor.create(parent, {
    value: source,
    language: language,
    //lineNumbers: false,
    theme: 'vs-dark',
    disableTranslate3d: true,
 //   model: null,
    scrollBeyondLastLine: false,
    minimap: { enabled: false },
  });
}

function runAsBlob() {
  const query = getQuery();
  g.url = getFQUrl(query.url);
  g.query = getSearch(g.url);
  getHTML(query.url, function(err, html) {
    if (err) {
      console.log(err);  // eslint-disable-line
      return;
    }
    parseHTML(query.url, html);
    window.location.href = getSourceBlobFromOrig();
  });
}

function start() {
  const parentQuery = getQuery(window.parent.location.search);
  const isSmallish = window.navigator.userAgent.match(/Android|iPhone|iPod|Windows Phone/i);
  const isEdge = window.navigator.userAgent.match(/Edge/i);
  if (isEdge || isSmallish || parentQuery.editor === 'false') {
    runAsBlob();
    // var url = query.url;
    // window.location.href = url;
  } else {
    require.config({ paths: { 'vs': '/monaco-editor/min/vs' }});
    require(['vs/editor/editor.main'], main);
  }
}

start();
}());



