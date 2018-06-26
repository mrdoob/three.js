(function() {
"use strict";

function getQuery(s) {
  s = s === undefined ? window.location.search : s;
  if (s[0] === '?' ) {
    s = s.substring(1);
  }
  var query = {};
  s.split('&').forEach(function(pair) {
      var parts = pair.split('=').map(decodeURIComponent);
      query[parts[0]] = parts[1];
  });
  return query;
}

function getSearch(url) {
  // yea I know this is not perfect but whatever
  var s = url.indexOf('?');
  return s < 0 ? {} : getQuery(url.substring(s));
}

const getFQUrl = (function() {
  const a = document.createElement("a");
  return function getFQUrl(url) {
    a.href = url;
    return a.href;
  };
}());

function getHTML(url, callback) {
  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.addEventListener('load', function() {
    var success = req.status === 200 || req.status === 0;
    callback(success ? null : 'could not load: ' + url, req.responseText);
  });
  req.addEventListener('timeout', function() {
    callback("timeout get: " + url);
  });
  req.addEventListener('error', function() {
    callback("error getting: " + url);
  });
  req.send("");
}

function fixSourceLinks(url, source) {
  var srcRE = /(src=)"(.*?)"/g;
  var linkRE = /(href=)"(.*?")/g;
  var imageSrcRE = /((?:image|img)\.src = )"(.*?)"/g;
  var loadImageRE = /(loadImageAndCreateTextureInfo)\(('|")(.*?)('|")/g;
  var loadImagesRE = /loadImages(\s*)\((\s*)\[([^]*?)\](\s*),/g;
  var quoteRE = /"(.*?)"/g;

  var u = new URL(window.location.origin + url);
  var prefix = u.origin + dirname(u.pathname);

  function addPrefix(url) {
    return url.indexOf("://") < 0 ? (prefix + url) : url;
  }
  function makeLinkFQed(match, p1, url) {
    return p1 + '"' + addPrefix(url) + '"';
  }
  source = source.replace(srcRE, makeLinkFQed);
  source = source.replace(linkRE, makeLinkFQed);
  source = source.replace(imageSrcRE, makeLinkFQed);
  source = source.replace(loadImageRE, function(match, fn, q1, url, q2) {
    return fn + '(' + q1 + addPrefix(url) + q2;
  });
  source = source.replace(loadImagesRE, function(match, p1, p2, p3, p4) {
      p3 = p3.replace(quoteRE, function(match, p1) {
          return '"' + addPrefix(p1) + '"';
      });
      return `loadImages${p1}(${p2}[${p3}]${p4},`;
  });

  return source;
}

var g = {
  html: '',
};

var htmlParts = {
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
    var info = htmlParts[name];
    fn(info, ndx, name);
  });
}


function getHTMLPart(re, obj, tag) {
  var part = '';
  obj.html = obj.html.replace(re, function(p0, p1) {
    part = p1;
    return tag;
  });
  return part.replace(/\s*/, '');
}

function parseHTML(url, html) {
  html = fixSourceLinks(url, html);

  html = html.replace(/<div class="description">[^]*?<\/div>/, '');

  var styleRE = /<style>([^]*?)<\/style>/i;
  var titleRE = /<title>([^]*?)<\/title>/i;
  var bodyRE = /<body>([^]*?)<\/body>/i;
  var inlineScriptRE = /<script>([^]*?)<\/script>/i;
  var externalScriptRE = /(<!--(?:(?!-->)[\s\S])*?-->\n){0,1}<script\s*src\s*=\s*"(.*?)"\s*>\s*<\/script>/ig;
  var dataScriptRE = /(<!--(?:(?!-->)[\s\S])*?-->\n){0,1}<script (.*?)>([^]*?)<\/script>/ig;
  var cssLinkRE = /<link ([^>]+?)>/g;
  var isCSSLinkRE = /type="text\/css"|rel="stylesheet"/;
  var hrefRE = /href="([^"]+)"/;

  var obj = { html: html };
  htmlParts.css.source = getHTMLPart(styleRE, obj, '<style>\n${css}</style>');
  htmlParts.html.source = getHTMLPart(bodyRE, obj, '<body>${html}</body>');
  htmlParts.js.source = getHTMLPart(inlineScriptRE, obj, '<script>${js}</script>');
  html = obj.html;

  var tm = titleRE.exec(html);
  if (tm) {
    g.title = tm[1];
  }

  var scripts = '';
  html = html.replace(externalScriptRE, function(p0, p1, p2) {
    p1 = p1 || '';
    scripts += '\n' + p1 + '<script src="' + p2 + '"></script>';
    return '';
  });

  var dataScripts = '';
  html = html.replace(dataScriptRE, function(p0, p1, p2, p3) {
    p1 = p1 || '';
    dataScripts += '\n' + p1 + '<script ' + p2 + '>' + p3 + '</script>';
    return '';
  });

  htmlParts.html.source += dataScripts;
  htmlParts.html.source += scripts + '\n';

  // add style section if there is non
  if (html.indexOf("${css}") < 0) {
    html = html.replace("</head>", "<style>\n${css}</style>\n</head>");
  }

  // add hackedparams section.
  // We need a way to pass parameters to a blob. Normally they'd be passed as
  // query params but that only works in Firefox >:(
  html = html.replace("</head>", '<script id="hackedparams">window.hackedParams = ${hackedParams}\n</script>\n</head>');

  var links = '';
  html = html.replace(cssLinkRE, function(p0, p1) {
    if (isCSSLinkRE.test(p1)) {
      var m = hrefRE.exec(p1);
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
  var query = getQuery();
  g.url = getFQUrl(query.url);
  g.query = getSearch(g.url);
  getHTML(query.url, function(err, html) {
    if (err) {
      console.log(err);  // eslint-disable-line
      return;
    }
    parseHTML(query.url, html);
    setupEditor(query.url);
  });
}


var blobUrl;
function getSourceBlob(options) {
  options = options || {};
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }
  var source = g.html;
  source = source.replace("${hackedParams}", JSON.stringify(g.query));
  source = source.replace('${html}', htmlParts.html.editor.getValue());
  source = source.replace('${css}', htmlParts.css.editor.getValue());
  source = source.replace('${js}', htmlParts.js.editor.getValue());
  source = source.replace('<head>', '<head>\n<script match="false">threejsLessonSettings = ' + JSON.stringify(options) + ";</script>");

  var scriptNdx = source.indexOf('<script>');
  g.numLinesBeforeScript = (source.substring(0, scriptNdx).match(/\n/g) || []).length;

  var blob = new Blob([source], {type: 'text/html'});
  blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}

function dirname(path) {
  var ndx = path.lastIndexOf("/");
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
    description           : "from: " + g.url,
    tags                  : ["three.js", "threejsfundamentals.org"],
    editors               : "101",
    html                  : htmlParts.html.editor.getValue(),
    css                   : htmlParts.css.editor.getValue(),
    js                    : comment + addCORSSupport(htmlParts.js.editor.getValue()),
  };

  const elem = document.createElement("div");
  elem.innerHTML = `
    <form method="POST" target="_blank" action="https://codepen.io/pen/define" class="hidden">'
      <input type="hidden" name="data">
      <input type="submit" />
    "</form>"
  `;
  elem.querySelector("input[name=data]").value = JSON.stringify(pen);
  window.frameElement.ownerDocument.body.appendChild(elem);
  elem.querySelector("form").submit();
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

  const elem = document.createElement("div");
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
  elem.querySelector("input[name=html]").value = htmlParts.html.editor.getValue();
  elem.querySelector("input[name=css]").value = htmlParts.css.editor.getValue();
  elem.querySelector("input[name=js]").value = comment + addCORSSupport(htmlParts.js.editor.getValue());
  elem.querySelector("input[name=title]").value = g.title;
  window.frameElement.ownerDocument.body.appendChild(elem);
  elem.querySelector("form").submit();
  window.frameElement.ownerDocument.body.removeChild(elem);
}

function setupEditor() {

  forEachHTMLPart(function(info, ndx, name) {
    info.parent = document.querySelector(".panes>." + name);
    info.editor = runEditor(info.parent, info.source, info.language);
    info.button = document.querySelector(".button-" + name);
    info.button.addEventListener('click', function() {
      toggleSourcePane(info.button);
      run();
    });
  });

  g.fullscreen = document.querySelector(".button-fullscreen");
  g.fullscreen.addEventListener('click', toggleFullscreen);

  g.run = document.querySelector(".button-run");
  g.run.addEventListener('click', run);

  g.iframe = document.querySelector(".result>iframe");
  g.other = document.querySelector(".panes .other");

  document.querySelector(".button-codepen").addEventListener('click', openInCodepen);
  document.querySelector(".button-jsfiddle").addEventListener('click', openInJSFiddle);

  g.result = document.querySelector(".panes .result");
  g.resultButton = document.querySelector(".button-result");
  g.resultButton.addEventListener('click', function() {
     toggleResultPane();
     run();
  });
  g.result.style.display = "none";
  toggleResultPane();

  if (window.innerWidth > 1200) {
    toggleSourcePane(htmlParts.js.button);
  }

  window.addEventListener('resize', resize);

  showOtherIfAllPanesOff();
  document.querySelector(".other .loading").style.display = "none";

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
  var url = getSourceBlob(options);
  g.iframe.src = url;
}

function addClass(elem, className) {
  var parts = elem.className.split(" ");
  if (parts.indexOf(className) < 0) {
    elem.className = elem.className + " " + className;
  }
}

function removeClass(elem, className) {
  var parts = elem.className.split(" ");
  var numParts = parts.length;
  for (;;) {
    var ndx = parts.indexOf(className);
    if (ndx < 0) {
      break;
    }
    parts.splice(ndx, 1);
  }
  if (parts.length !== numParts) {
    elem.className = parts.join(" ");
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
    const isFullScreen = toggleClass(frame, "fullscreen");
    frame.ownerDocument.body.style.overflow = isFullScreen ? "hidden" : "";
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
    var pressed = pressedButton === info.button;
    if (pressed && !info.showing) {
      addClass(info.button, "show");
      info.parent.style.display = "block";
      info.showing = true;
    } else {
      removeClass(info.button, "show");
      info.parent.style.display = "none";
      info.showing = false;
    }
  });
  showOtherIfAllPanesOff();
  resize();
}

function showingResultPane() {
  return g.result.style.display !== "none";
}
function toggleResultPane() {
  var showing = showingResultPane();
  g.result.style.display = showing ? "none" : "block";
  addRemoveClass(g.resultButton, "show", !showing);
  showOtherIfAllPanesOff();
  resize();
}

function showOtherIfAllPanesOff() {
  var paneOn = showingResultPane();
  forEachHTMLPart(function(info) {
    paneOn = paneOn || info.showing;
  });
  g.other.style.display = paneOn ? "none" : "block";
}

function getActualLineNumberAndMoveTo(lineNo, colNo) {
  var actualLineNo = lineNo - g.numLinesBeforeScript;
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

function start() {
  var query = getQuery();
  var parentQuery = getQuery(window.parent.location.search);
  var isSmallish = window.navigator.userAgent.match(/Android|iPhone|iPod|Windows Phone/i);
  var isEdge = window.navigator.userAgent.match(/Edge/i);
  if (isEdge || isSmallish || parentQuery.editor === 'false') {
    var url = query.url;
    window.location.href = url;
  } else {
    require.config({ paths: { 'vs': '/monaco-editor/min/vs' }});
    require(['vs/editor/editor.main'], main);
  }
}
start();
}());



