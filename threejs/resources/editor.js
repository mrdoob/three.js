(function() {  // eslint-disable-line strict
'use strict';  // eslint-disable-line strict

/* global monaco, require, lessonEditorSettings */

const {
  fixSourceLinks,
  fixJSForCodeSite,
  extraHTMLParsing,
  runOnResize,
  lessonSettings,
} = lessonEditorSettings;

const lessonHelperScriptRE = /<script src="[^"]+lessons-helper\.js"><\/script>/;

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

function getFQUrl(path, baseUrl) {
  const url = new URL(path, baseUrl || window.location.href);
  return url.href;
}

async function getHTML(url) {
  const req = await fetch(url);
  return await req.text();
}

function getPrefix(url) {
  const u = new URL(url, window.location.href);
  const prefix = u.origin + dirname(u.pathname);
  return prefix;
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

/**
 * @typedef {Object} Globals
 * @property {SourceInfo} rootScriptInfo
 * @property {Object<string, SourceInfo} scriptInfos
 */

/** @type {Globals} */
const g = {
  html: '',
};

/**
 * This is what's in the sources array
 * @typedef {Object} SourceInfo
 * @property {string} source The source text (html, css, js)
 * @property {string} name The filename or "main page"
 * @property {ScriptInfo} scriptInfo The associated ScriptInfo
 * @property {string} fqURL ??
 * @property {Editor} editor in instance of Monaco editor
 *
 */

/**
 * @typedef {Object} EditorInfo
 * @property {HTMLElement} div The div holding the monaco editor
 * @property {Editor} editor an instance of a monaco editor
 */

/**
 * What's under each language
 * @typedef {Object} HTMLPart
 * @property {string} language Name of language
 * @property {SourceInfo} sources array of SourceInfos. Usually 1 for HTML, 1 for CSS, N for JS
 * @property {HTMLElement} pane the pane for these editors
 * @property {HTMLElement} code the div holding the files
 * @property {HTMLElement} files the div holding the divs holding the monaco editors
 * @property {HTMLElement} button the element to click to show this pane
 * @property {EditorInfo} editors
 */

/** @type {Object<string, HTMLPart>} */
const htmlParts = {
  js: {
    language: 'javascript',
    sources: [],
  },
  css: {
    language: 'css',
    sources: [],
  },
  html: {
    language: 'html',
    sources: [],
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

// doesn't handle multi-line comments or comments with { or } in them
function formatCSS(css) {
  let indent = '';
  return css.split('\n').map((line) => {
    let currIndent = indent;
    if (line.includes('{')) {
      indent = indent + '  ';
    } else if (line.includes('}')) {
      indent = indent.substring(0, indent.length - 2);
      currIndent = indent;
    }
    return `${currIndent}${line.trim()}`;
  }).join('\n');
}

async function getScript(url, scriptInfos) {
  // check it's an example script, not some other lib
  if (!scriptInfos[url].source) {
    const source = await getHTML(url);
    const fixedSource = fixSourceLinks(url, source);
    const {text} = await getWorkerScripts(fixedSource, url, scriptInfos);
    scriptInfos[url].source = text;
  }
}

/**
 * @typedef {Object} ScriptInfo
 * @property {string} fqURL The original fully qualified URL
 * @property {ScriptInfo[]} deps Array of other ScriptInfos this is script dependant on
 * @property {boolean} isWorker True if this script came from `new Worker('someurl')` vs `import` or `importScripts`
 * @property {string} blobUrl The blobUrl for this script if one has been made
 * @property {number} blobGenerationId Used to not visit things twice while recursing.
 * @property {string} source The source as extracted. Updated from editor by getSourcesFromEditor
 * @property {string} munged The source after urls have been replaced with blob urls etc... (the text send to new Blob)
 */

async function getWorkerScripts(text, baseUrl, scriptInfos = {}) {
  const parentScriptInfo = scriptInfos[baseUrl];
  const workerRE = /(new\s+Worker\s*\(\s*)('|")(.*?)('|")/g;
  const importScriptsRE = /(importScripts\s*\(\s*)('|")(.*?)('|")/g;

  const newScripts = [];
  const slashRE = /\/threejs\/[^/]+$/;

  function replaceWithUUID(match, prefix, quote, url) {
    const fqURL = getFQUrl(url, baseUrl);
    if (!slashRE.test(fqURL)) {
      return match.toString();
    }

    if (!scriptInfos[url]) {
      scriptInfos[fqURL] = {
        fqURL,
        deps: [],
        isWorker: prefix.indexOf('Worker') >= 0,
      };
      newScripts.push(fqURL);
    }
    parentScriptInfo.deps.push(scriptInfos[fqURL]);

    return `${prefix}${quote}${fqURL}${quote}`;
  }

  text = text.replace(workerRE, replaceWithUUID);
  text = text.replace(importScriptsRE, replaceWithUUID);

  await Promise.all(newScripts.map((url) => {
    return getScript(url, scriptInfos);
  }));

  return {text, scriptInfos};
}

// hack: scriptInfo is undefined for html and css
// should try to include html and css in scriptInfos
function addSource(type, name, source, scriptInfo) {
  htmlParts[type].sources.push({source, name, scriptInfo});
}

async function parseHTML(url, html) {
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
  addSource('css', 'css', formatCSS(fixCSSLinks(url, getHTMLPart(styleRE, obj, '<style>\n${css}</style>'))));
  addSource('html', 'html', getHTMLPart(bodyRE, obj, '<body>${html}</body>'));
  const rootScript = getHTMLPart(inlineScriptRE, obj, '<script>${js}</script>');
  html = obj.html;

  const fqURL = getFQUrl(url);
  /** @type Object<string, SourceInfo> */
  const scriptInfos = {};
  g.rootScriptInfo = {
    fqURL,
    deps: [],
    source: rootScript,
  };
  scriptInfos[fqURL] = g.rootScriptInfo;

  const {text} = await getWorkerScripts(rootScript, fqURL, scriptInfos);
  g.rootScriptInfo.source = text;
  g.scriptInfos = scriptInfos;
  for (const [fqURL, scriptInfo] of Object.entries(scriptInfos)) {
    addSource('js', basename(fqURL), scriptInfo.source, scriptInfo);
  }

  const tm = titleRE.exec(html);
  if (tm) {
    g.title = tm[1];
  }

  const scripts = [];
  html = html.replace(externalScriptRE, function(p0, p1, p2) {
    p1 = p1 || '';
    scripts.push(`${p1}<script src="${p2}"></script>`);
    return '';
  });

  const dataScripts = [];
  html = html.replace(dataScriptRE, function(p0, p1, p2, p3) {
    p1 = p1 || '';
    dataScripts.push(`${p1}<script ${p2}>${p3}</script>`);
    return '';
  });

  htmlParts.html.sources[0].source += dataScripts.join('\n');
  htmlParts.html.sources[0].source += scripts.join('\n');

  // add style section if there is non
  if (html.indexOf('${css}') < 0) {
    html = html.replace('</head>', '<style>\n${css}</style>\n</head>');
  }

  // add hackedparams section.
  // We need a way to pass parameters to a blob. Normally they'd be passed as
  // query params but that only works in Firefox >:(
  html = html.replace('</head>', '<script id="hackedparams">window.hackedParams = ${hackedParams}\n</script>\n</head>');

  html = extraHTMLParsing(html, htmlParts);

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

  htmlParts.css.sources[0].source = links + htmlParts.css.sources[0].source;

  g.html = html;
}

function cantGetHTML(e) {  // eslint-disable-line
  console.log(e);  // eslint-disable-line
  console.log("TODO: don't run editor if can't get HTML");  // eslint-disable-line
}

async function main() {
  const query = getQuery();
  g.url = getFQUrl(query.url);
  g.query = getSearch(g.url);
  let html;
  try {
    html = await getHTML(query.url);
  } catch (err) {
    console.log(err);  // eslint-disable-line
    return;
  }
  await parseHTML(query.url, html);
  setupEditor(query.url);
  if (query.startPane) {
    const button = document.querySelector('.button-' + query.startPane);
    toggleSourcePane(button);
  }
}

function getJavaScriptBlob(source) {
  const blob = new Blob([source], {type: 'application/javascript'});
  return URL.createObjectURL(blob);
}

let blobGeneration = 0;
function makeBlobURLsForSources(scriptInfo) {
  ++blobGeneration;

  function makeBlobURLForSourcesImpl(scriptInfo) {
    if (scriptInfo.blobGenerationId !== blobGeneration) {
      scriptInfo.blobGenerationId = blobGeneration;
      if (scriptInfo.blobUrl) {
        URL.revokeObjectURL(scriptInfo.blobUrl);
      }
      scriptInfo.deps.forEach(makeBlobURLForSourcesImpl);
      let text = scriptInfo.source;
      scriptInfo.deps.forEach((depScriptInfo) => {
        text = text.split(depScriptInfo.fqURL).join(depScriptInfo.blobUrl);
      });
      scriptInfo.numLinesBeforeScript = 0;
      if (scriptInfo.isWorker) {
        const extra = `self.lessonSettings = ${JSON.stringify(lessonSettings)};
importScripts('${dirname(scriptInfo.fqURL)}/resources/lessons-worker-helper.js')`;
        scriptInfo.numLinesBeforeScript = extra.split('\n').length;
        text = `${extra}\n${text}`;
      }
      scriptInfo.blobUrl = getJavaScriptBlob(text);
      scriptInfo.munged = text;
    }
  }
  makeBlobURLForSourcesImpl(scriptInfo);
}

function getSourceBlob(htmlParts) {
  g.rootScriptInfo.source = htmlParts.js;
  makeBlobURLsForSources(g.rootScriptInfo);

  const prefix = dirname(g.url);
  let source = g.html;
  source = source.replace('${hackedParams}', JSON.stringify(g.query));
  source = source.replace('${html}', htmlParts.html);
  source = source.replace('${css}', htmlParts.css);
  source = source.replace('${js}', g.rootScriptInfo.munged); //htmlParts.js);
  source = source.replace('<head>', `<head>
  <link rel="stylesheet" href="${prefix}/resources/lesson-helper.css" type="text/css">
  <script match="false">self.lessonSettings = ${JSON.stringify(lessonSettings)}</script>`);

  source = source.replace('</head>', `<script src="${prefix}/resources/lessons-helper.js"></script>
  </head>`);
  const scriptNdx = source.indexOf('<script>');
  g.rootScriptInfo.numLinesBeforeScript = (source.substring(0, scriptNdx).match(/\n/g) || []).length;

  const blob = new Blob([source], {type: 'text/html'});
  // This seems hacky. We are combining html/css/js into one html blob but we already made
  // a blob for the JS so let's replace that blob. That means it will get auto-released when script blobs
  // are regenerated. It also means error reporting will work
  const blobUrl = URL.createObjectURL(blob);
  URL.revokeObjectURL(g.rootScriptInfo.blobUrl);
  g.rootScriptInfo.blobUrl = blobUrl;
  return blobUrl;
}

function getSourcesFromEditor() {
  for (const partTypeInfo of Object.values(htmlParts)) {
    for (const source of partTypeInfo.sources) {
      source.source = source.editor.getValue();
      // hack: shouldn't store this twice. Also see other comment,
      // should consolidate so scriptInfo is used for css and html
      if (source.scriptInfo) {
        source.scriptInfo.source = source.source;
      }
    }
  }
}
function getSourceBlobFromEditor() {
  getSourcesFromEditor();

  return getSourceBlob({
    html: htmlParts.html.sources[0].source,
    css: htmlParts.css.sources[0].source,
    js: htmlParts.js.sources[0].source,
  });
}

function getSourceBlobFromOrig() {
  return getSourceBlob({
    html: htmlParts.html.sources[0].source,
    css: htmlParts.css.sources[0].source,
    js: htmlParts.js.sources[0].source,
  });
}

function dirname(path) {
  const ndx = path.lastIndexOf('/');
  return path.substring(0, ndx + 1);
}

function basename(path) {
  const ndx = path.lastIndexOf('/');
  return path.substring(ndx + 1);
}

function resize() {
  forEachHTMLPart(function(info) {
    info.editors.forEach((editorInfo) => {
      editorInfo.editor.layout();
    });
  });
}

function makeScriptsForWorkers(scriptInfo) {
  ++blobGeneration;

  function makeScriptsForWorkersImpl(scriptInfo) {
    const scripts = [];
    if (scriptInfo.blobGenerationId !== blobGeneration) {
      scriptInfo.blobGenerationId = blobGeneration;
      scripts.push(...scriptInfo.deps.map(makeScriptsForWorkersImpl).flat());
      let text = scriptInfo.source;
      scriptInfo.deps.forEach((depScriptInfo) => {
        text = text.split(depScriptInfo.fqURL).join(`worker-${basename(depScriptInfo.fqURL)}`);
      });

      scripts.push({
        name: `worker-${basename(scriptInfo.fqURL)}`,
        text,
      });
    }
    return scripts;
  }

  const scripts = makeScriptsForWorkersImpl(scriptInfo);
  const mainScript = scripts.pop().text;
  if (!scripts.length) {
    return {
      js: mainScript,
      html: '',
    };
  }

  const workerName = scripts[scripts.length - 1].name;
  const html = scripts.map((nameText) => {
    const {name, text} = nameText;
    return `<script id="${name}" type="x-worker">\n${text}\n</script>`;
  }).join('\n');
  const init = `



// ------
// Creates Blobs for the Worker Scripts so things can be self contained for snippets/JSFiddle/Codepen
//
function getWorkerBlob() {
  const idsToUrls = [];
  const scriptElements = [...document.querySelectorAll('script[type=x-worker]')];
  for (const scriptElement of scriptElements) {
    let text = scriptElement.text;
    for (const {id, url} of idsToUrls) {
      text = text.split(id).join(url);
    }
    const blob = new Blob([text], {type: 'application/javascript'});
    const url = URL.createObjectURL(blob);
    const id = scriptElement.id;
    idsToUrls.push({id, url});
  }
  return idsToUrls.pop().url;
}
`;
  return {
    js: mainScript.split(`'${workerName}'`).join('getWorkerBlob()') + init,
    html,
  };
}

function openInCodepen() {
  const comment = `// ${g.title}
// from ${g.url}


  `;
  getSourcesFromEditor();
  const scripts = makeScriptsForWorkers(g.rootScriptInfo);
  const pen = {
    title                 : g.title,
    description           : 'from: ' + g.url,
    tags                  : lessonEditorSettings.tags,
    editors               : '101',
    html                  : scripts.html + htmlParts.html.sources[0].source.replace(lessonHelperScriptRE, ''),
    css                   : htmlParts.css.sources[0].source,
    js                    : comment + fixJSForCodeSite(scripts.js),
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

  getSourcesFromEditor();
  const scripts = makeScriptsForWorkers(g.rootScriptInfo);

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
  elem.querySelector('input[name=html]').value = scripts.html + htmlParts.html.sources[0].source.replace(lessonHelperScriptRE, '');
  elem.querySelector('input[name=css]').value = htmlParts.css.sources[0].source;
  elem.querySelector('input[name=js]').value = comment + fixJSForCodeSite(scripts.js);
  elem.querySelector('input[name=title]').value = g.title;
  window.frameElement.ownerDocument.body.appendChild(elem);
  elem.querySelector('form').submit();
  window.frameElement.ownerDocument.body.removeChild(elem);
}

function selectFile(info, ndx, fileDivs) {
  if (info.editors.length <= 1) {
    return;
  }
  info.editors.forEach((editorInfo, i) => {
    const selected = i === ndx;
    editorInfo.div.style.display = selected ? '' : 'none';
    editorInfo.editor.layout();
    addRemoveClass(fileDivs.children[i], 'fileSelected', selected);
  });
}

function showEditorSubPane(type, ndx) {
  const info = htmlParts[type];
  selectFile(info, ndx, info.files);
}

function setupEditor() {

  forEachHTMLPart(function(info, ndx, name) {
    info.pane = document.querySelector('.panes>.' + name);
    info.code = info.pane.querySelector('.code');
    info.files = info.pane.querySelector('.files');
    info.editors = info.sources.map((sourceInfo, ndx) => {
      if (info.sources.length > 1) {
        const div = document.createElement('div');
        div.textContent = basename(sourceInfo.name);
        info.files.appendChild(div);
        div.addEventListener('click', () => {
          selectFile(info, ndx, info.files);
        });
      }
      const div = document.createElement('div');
      info.code.appendChild(div);
      const editor = runEditor(div, sourceInfo.source, info.language);
      sourceInfo.editor = editor;
      return {
        div,
        editor,
      };
    });
    info.button = document.querySelector('.button-' + name);
    info.button.addEventListener('click', function() {
      toggleSourcePane(info.button);
      runIfNeeded();
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
     runIfNeeded();
  });
  g.result.style.display = 'none';
  toggleResultPane();

  if (window.innerWidth > 1200) {
    toggleSourcePane(htmlParts.js.button);
  }

  window.addEventListener('resize', resize);

  showEditorSubPane('js', 0);
  showOtherIfAllPanesOff();
  document.querySelector('.other .loading').style.display = 'none';

  resize();
  run();
}

function toggleFullscreen() {
  try {
    toggleIFrameFullscreen(window);
    resize();
    runIfNeeded();
  } catch (e) {
    console.error(e);  // eslint-disable-line
  }
}

function runIfNeeded() {
  if (runOnResize) {
    run();
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
      info.pane.style.display = 'flex';
      info.showing = true;
    } else {
      removeClass(info.button, 'show');
      info.pane.style.display = 'none';
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

// seems like we should probably store a map
function getEditorNdxByBlobUrl(type, url) {
  return htmlParts[type].sources.findIndex(source => source.scriptInfo.blobUrl === url);
}

function getActualLineNumberAndMoveTo(url, lineNo, colNo) {
  let origUrl = url;
  let actualLineNo = lineNo;
  const scriptInfo = Object.values(g.scriptInfos).find(scriptInfo => scriptInfo.blobUrl === url);
  if (scriptInfo) {
    actualLineNo = lineNo - scriptInfo.numLinesBeforeScript;
    origUrl = basename(scriptInfo.fqURL);
    if (!g.setPosition) {
      // Only set the first position
      g.setPosition = true;
      const editorNdx = getEditorNdxByBlobUrl('js', url);
      if (editorNdx >= 0) {
        showEditorSubPane('js', editorNdx);
        const editor = htmlParts.js.editors[editorNdx].editor;
        editor.setPosition({
          lineNumber: actualLineNo,
          column: colNo,
        });
        editor.revealLineInCenterIfOutsideViewport(actualLineNo);
        editor.focus();
      }
    }
  }
  return {origUrl, actualLineNo};
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

async function runAsBlob() {
  const query = getQuery();
  g.url = getFQUrl(query.url);
  g.query = getSearch(g.url);
  let html;
  try {
    html = await getHTML(query.url);
  } catch (err) {
    console.log(err);  // eslint-disable-line
    return;
  }
  await parseHTML(query.url, html);
  window.location.href = getSourceBlobFromOrig();
}

function applySubstitutions() {
  [...document.querySelectorAll('[data-subst]')].forEach((elem) => {
    elem.dataset.subst.split('&').forEach((pair) => {
      const [attr, key] = pair.split('|');
      elem[attr] = lessonEditorSettings[key];
    });
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
    applySubstitutions();
    require.config({ paths: { 'vs': '/monaco-editor/min/vs' }});
    require(['vs/editor/editor.main'], main);
  }
}

start();
}());



