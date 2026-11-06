// The Tern server object

// A server is a stateful object that manages the analysis for a
// project, and defines an interface for querying the code in the
// project.

(function(root, mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    return mod(exports, require("./infer"), require("./signal"),
               require("acorn"), require("acorn-walk"));
  if (typeof define == "function" && define.amd) // AMD
    return define(["exports", "./infer", "./signal", "acorn/dist/acorn", "acorn-walk/dist/walk"], mod);
  mod(root.tern || (root.tern = {}), tern, tern.signal, acorn, acorn.walk); // Plain browser env
})(this, function(exports, infer, signal, acorn, walk) {
  "use strict";

  var plugins = Object.create(null);
  exports.registerPlugin = function(name, init) { plugins[name] = init; };

  var defaultOptions = exports.defaultOptions = {
    debug: false,
    async: false,
    getFile: function(_f, c) { if (this.async) c(null, null); },
    normalizeFilename: function(name) { return name },
    defs: [],
    plugins: {},
    fetchTimeout: 1000,
    dependencyBudget: 20000,
    reuseInstances: true,
    stripCRs: false,
    ecmaVersion: 9,
    projectDir: "/",
    parent: null
  };

  var queryTypes = {
    completions: {
      takesFile: true,
      run: findCompletions
    },
    properties: {
      run: findProperties
    },
    type: {
      takesFile: true,
      run: findTypeAt
    },
    documentation: {
      takesFile: true,
      run: findDocs
    },
    definition: {
      takesFile: true,
      run: findDef
    },
    refs: {
      takesFile: true,
      fullFile: true,
      run: findRefs
    },
    rename: {
      takesFile: true,
      fullFile: true,
      run: buildRename
    },
    files: {
      run: listFiles
    }
  };

  exports.defineQueryType = function(name, desc) { queryTypes[name] = desc; };

  function File(name, parent) {
    this.name = name;
    this.parent = parent;
    this.scope = this.text = this.ast = this.lineOffsets = null;
  }
  File.prototype.asLineChar = function(pos) { return asLineChar(this, pos); };

  function parseFile(srv, file) {
    var options = {
      directSourceFile: file,
      allowReturnOutsideFunction: true,
      allowImportExportEverywhere: true,
      ecmaVersion: srv.options.ecmaVersion,
      allowHashBang: true
    };
    var text = srv.signalReturnFirst("preParse", file.text, options) || file.text;
    var ast = infer.parse(text, options);
    srv.signal("postParse", ast, text);
    return ast;
  }

  var astral = /[\uD800-\uDBFF]/g;

  function updateText(file, text, srv) {
    file.text = srv.options.stripCRs ? text.replace(/\r\n/g, "\n") : text;
    file.hasAstral = astral.test(file.text);
    infer.withContext(srv.cx, function() {
      file.ast = parseFile(srv, file);
    });
    file.lineOffsets = null;
  }

  var Server = exports.Server = function(options) {
    this.cx = null;
    this.options = options || {};
    for (var o in defaultOptions) if (!options.hasOwnProperty(o))
      options[o] = defaultOptions[o];

    this.projectDir = options.projectDir.replace(/\\/g, "/");
    if (!/\/$/.test(this.projectDir)) this.projectDir += "/";

    this.parent = options.parent;
    this.handlers = Object.create(null);
    this.files = [];
    this.fileMap = Object.create(null);
    this.needsPurge = [];
    this.budgets = Object.create(null);
    this.uses = 0;
    this.pending = 0;
    this.asyncError = null;
    this.mod = {};

    this.defs = options.defs.slice(0);
    this.plugins = Object.create(null);
    for (var plugin in options.plugins) if (options.plugins.hasOwnProperty(plugin))
      this.loadPlugin(plugin, options.plugins[plugin]);

    this.reset();
  };
  Server.prototype = signal.mixin({
    addFile: function(name, /*optional*/ text, parent) {
      // Don't crash when sloppy plugins pass non-existent parent ids
      if (parent && !(parent in this.fileMap)) parent = null;
      if (!(name in this.fileMap))
        name = this.normalizeFilename(name);
      ensureFile(this, name, parent, text);
    },
    delFile: function(name) {
      var file = this.findFile(name);
      if (file) {
        this.needsPurge.push(file.name);
        for (var i = 0; i < this.files.length; i++) {
          if (this.files[i] == file) this.files.splice(i--, 1);
          else if (this.files[i].parent == name) this.files[i].parent = null;
        }
        delete this.fileMap[file.name];
      }
    },
    reset: function() {
      this.signal("reset");
      this.cx = new infer.Context(this.defs, this);
      this.uses = 0;
      this.budgets = Object.create(null);
      for (var i = 0; i < this.files.length; ++i) {
        var file = this.files[i];
        if (file.scope) {
          infer.clearScopes(file.ast);
          file.scope = null;
        }
      }
      this.signal("postReset");
    },

    request: function(doc, c) {
      var inv = invalidDoc(doc);
      if (inv) return c(inv);

      var self = this;
      doRequest(this, doc, function(err, data) {
        c(err, data);
        if (self.uses > 40) {
          self.reset();
          analyzeAll(self, null, function(){});
        }
      });
    },

    findFile: function(name) {
      return this.fileMap[this.normalizeFilename(name)];
    },

    flush: function(c) {
      var cx = this.cx;
      analyzeAll(this, null, function(err) {
        if (err) return c(err);
        infer.withContext(cx, c);
      });
    },

    startAsyncAction: function() {
      ++this.pending;
    },
    finishAsyncAction: function(err) {
      if (err) this.asyncError = err;
      if (--this.pending === 0) this.signal("everythingFetched");
    },

    addDefs: function(defs, toFront) {
      if (toFront) this.defs.unshift(defs);
      else this.defs.push(defs);

      if (this.cx) this.reset();
    },

    deleteDefs: function(name) {
      for (var i = 0; i < this.defs.length; i++) if (this.defs[i]["!name"] == name) {
        this.defs.splice(i, 1);
        if (this.cx) this.reset();
        return;
      }
    },

    loadPlugin: function(name, options) {
      if (arguments.length == 1) options = this.options.plugins[name] || true;
      if (name in this.plugins || !(name in plugins) || !options) return;
      this.plugins[name] = true;
      var init = plugins[name](this, options);

      // This is for backwards-compatibilty. Don't rely on it -- use addDef and on directly
      if (!init) return;
      if (init.defs) this.addDefs(init.defs, init.loadFirst);
      if (init.passes) for (var type in init.passes) if (init.passes.hasOwnProperty(type))
        this.on(type, init.passes[type]);
    },

    normalizeFilename: function(name) {
      var norm = this.options.normalizeFilename(name).replace(/\\/g, "/");
      if (norm.indexOf(this.projectDir) == 0) norm = norm.slice(this.projectDir.length);
      return norm;
    }
  });

  function doRequest(srv, doc, c) {
    if (doc.query && !queryTypes.hasOwnProperty(doc.query.type))
      return c("No query type '" + doc.query.type + "' defined");

    var query = doc.query;
    // Respond as soon as possible when this just uploads files
    if (!query) c(null, {});

    var files = doc.files || [];
    if (files.length) ++srv.uses;
    for (var i = 0; i < files.length; ++i) {
      var file = files[i];
      file.name = srv.normalizeFilename(file.name);
      if (file.type == "delete")
        srv.delFile(file.name);
      else
        ensureFile(srv, file.name, null, file.type == "full" ? file.text : null);
    }

    var timeBudget = typeof doc.timeout == "number" ? [doc.timeout] : null;
    if (!query) {
      analyzeAll(srv, timeBudget, function(){});
      return;
    }

    var queryType = queryTypes[query.type];
    if (queryType.takesFile) {
      if (typeof query.file != "string") return c(".query.file must be a string");
      if (!/^#/.test(query.file)) ensureFile(srv, query.file, null);
    }

    analyzeAll(srv, timeBudget, function(err) {
      if (err) return c(err);
      var file = queryType.takesFile && resolveFile(srv, files, query.file);
      if (queryType.fullFile && file.type == "part")
        return c("Can't run a " + query.type + " query on a file fragment");

      infer.resetGuessing();
      infer.withContext(srv.cx, function() {
        var result, run = function() { result = queryType.run(srv, query, file); };
        try {
          if (timeBudget) infer.withTimeout(timeBudget[0], run);
          else run();
        } catch (e) {
          if (srv.options.debug && e.name != "TernError") console.error(e.stack);
          return c(e);
        }
        c(null, result);
      });
    });
  }

  function analyzeFile(srv, file) {
    infer.withContext(srv.cx, function() {
      file.scope = srv.cx.topScope;
      srv.signal("beforeLoad", file);
      infer.analyze(file.ast, file.name, file.scope);
      srv.signal("afterLoad", file);
    });
    return file;
  }

  function ensureFile(srv, name, parent, text) {
    var known = srv.findFile(name);
    if (known) {
      if (text != null) {
        if (known.scope) {
          srv.needsPurge.push(name);
          infer.clearScopes(known.ast);
          known.scope = null;
        }
        updateText(known, text, srv);
      }
      if (parentDepth(srv, known.parent) > parentDepth(srv, parent)) {
        known.parent = parent;
        if (known.excluded) known.excluded = null;
      }
      return;
    }

    var file = new File(name, parent);
    srv.files.push(file);
    srv.fileMap[name] = file;
    if (text != null) {
      updateText(file, text, srv);
    } else if (srv.options.async) {
      srv.startAsyncAction();
      srv.options.getFile(name, function(err, text) {
        updateText(file, text || "", srv);
        srv.finishAsyncAction(err);
      });
    } else {
      updateText(file, srv.options.getFile(name) || "", srv);
    }
  }

  function fetchAll(srv, c) {
    var done = true, returned = false;
    srv.files.forEach(function(file) {
      if (file.text != null) return;
      if (srv.options.async) {
        done = false;
        srv.options.getFile(file.name, function(err, text) {
          if (err && !returned) { returned = true; return c(err); }
          updateText(file, text || "", srv);
          fetchAll(srv, c);
        });
      } else {
        try {
          updateText(file, srv.options.getFile(file.name) || "", srv);
        } catch (e) { return c(e); }
      }
    });
    if (done) c();
  }

  function waitOnFetch(srv, timeBudget, c) {
    var done = function() {
      srv.off("everythingFetched", done);
      clearTimeout(timeout);
      analyzeAll(srv, timeBudget, c);
    };
    srv.on("everythingFetched", done);
    var timeout = setTimeout(done, srv.options.fetchTimeout);
  }

  function analyzeAll(srv, timeBudget, c) {
    if (srv.pending) return waitOnFetch(srv, timeBudget, c);

    var e = srv.fetchError;
    if (e) { srv.fetchError = null; return c(e); }

    if (srv.needsPurge.length > 0) infer.withContext(srv.cx, function() {
      infer.purge(srv.needsPurge);
      srv.needsPurge.length = 0;
    });

    var done = true;
    // The second inner loop might add new files. The outer loop keeps
    // repeating both inner loops until all files have been looked at.
    for (var i = 0; i < srv.files.length;) {
      var toAnalyze = [];
      for (; i < srv.files.length; ++i) {
        var file = srv.files[i];
        if (file.text == null) done = false;
        else if (file.scope == null && !file.excluded) toAnalyze.push(file);
      }
      toAnalyze.sort(function(a, b) {
        return parentDepth(srv, a.parent) - parentDepth(srv, b.parent);
      });
      for (var j = 0; j < toAnalyze.length; j++) {
        var file = toAnalyze[j];
        if (file.parent && !chargeOnBudget(srv, file)) {
          file.excluded = true;
        } else if (timeBudget) {
          var startTime = +new Date;
          try {
            infer.withTimeout(timeBudget[0], function() { analyzeFile(srv, file); });
          } catch(e) {
            if (e instanceof infer.TimedOut) return c(e);
            else throw e;
          }
          timeBudget[0] -= +new Date - startTime;
        } else {
          analyzeFile(srv, file);
        }
      }
    }
    if (done) c();
    else waitOnFetch(srv, timeBudget, c);
  }

  function firstLine(str) {
    var end = str.indexOf("\n");
    if (end < 0) return str;
    return str.slice(0, end);
  }

  function findMatchingPosition(line, file, near) {
    var pos = Math.max(0, near - 500), closest = null;
    if (!/^\s*$/.test(line)) for (;;) {
      var found = file.indexOf(line, pos);
      if (found < 0 || found > near + 500) break;
      if (closest == null || Math.abs(closest - near) > Math.abs(found - near))
        closest = found;
      pos = found + line.length;
    }
    return closest;
  }

  function scopeDepth(s) {
    for (var i = 0; s; ++i, s = s.prev) {}
    return i;
  }

  function ternError(msg) {
    var err = new Error(msg);
    err.name = "TernError";
    return err;
  }

  function resolveFile(srv, localFiles, name) {
    var isRef = name.match(/^#(\d+)$/);
    if (!isRef) return srv.findFile(name);

    var file = localFiles[isRef[1]];
    if (!file || file.type == "delete") throw ternError("Reference to unknown file " + name);
    if (file.type == "full") return srv.fileMap[file.name];

    // This is a partial file

    var realFile = file.backing = srv.fileMap[file.name];
    var offset = resolvePos(realFile, file.offsetLines == null ? file.offset : {line: file.offsetLines, ch: 0}, true);
    var line = firstLine(file.text);
    var foundPos = findMatchingPosition(line, realFile.text, offset);
    var pos = foundPos == null ? Math.max(0, realFile.text.lastIndexOf("\n", offset)) : foundPos;
    var inObject, atFunction;

    infer.withContext(srv.cx, function() {
      infer.purge(file.name, pos, pos + file.text.length);

      var text = file.text, m;
      if (m = text.match(/(?:"([^"]*)"|([\w$]+))\s*:\s*function\b/)) {
        var objNode = walk.findNodeAround(file.backing.ast, pos, "ObjectExpression");
        if (objNode && objNode.node.objType)
          inObject = {type: objNode.node.objType, prop: m[2] || m[1]};
      }
      if (foundPos && (m = line.match(/^(.*?)\bfunction\b/))) {
        var cut = m[1].length, white = "";
        for (var i = 0; i < cut; ++i) white += " ";
        file.text = white + text.slice(cut);
        atFunction = true;
      }

      var scopeStart = infer.scopeAt(realFile.ast, pos, realFile.scope);
      var scopeEnd = infer.scopeAt(realFile.ast, pos + text.length, realFile.scope);
      var scope = file.scope = scopeDepth(scopeStart) < scopeDepth(scopeEnd) ? scopeEnd : scopeStart;
      file.ast = parseFile(srv, file);
      infer.analyze(file.ast, file.name, scope);

      // This is a kludge to tie together the function types (if any)
      // outside and inside of the fragment, so that arguments and
      // return values have some information known about them.
      tieTogether: {
        if (inObject || atFunction) {
          var newInner = infer.scopeAt(file.ast, line.length, scopeStart);
          if (!newInner.fnType) break tieTogether;
          if (inObject) {
            var prop = inObject.type.getProp(inObject.prop);
            prop.addType(newInner.fnType);
          } else if (atFunction) {
            var inner = infer.scopeAt(realFile.ast, pos + line.length, realFile.scope);
            if (inner == scopeStart || !inner.fnType) break tieTogether;
            var fOld = inner.fnType, fNew = newInner.fnType;
            if (!fNew || (fNew.name != fOld.name && fOld.name)) break tieTogether;
            for (var i = 0, e = Math.min(fOld.args.length, fNew.args.length); i < e; ++i)
              fOld.args[i].propagate(fNew.args[i]);
            fOld.self.propagate(fNew.self);
            fNew.retval.propagate(fOld.retval);
          }
        }
      }
    });
    return file;
  }

  // Budget management

  function astSize(node) {
    var size = 0;
    walk.simple(node, {Expression: function() { ++size; }});
    return size;
  }

  function parentDepth(srv, parent) {
    var depth = 0;
    while (parent) {
      parent = srv.fileMap[parent].parent;
      ++depth;
    }
    return depth;
  }

  function budgetName(srv, file) {
    for (;;) {
      var parent = srv.fileMap[file.parent];
      if (!parent.parent) break;
      file = parent;
    }
    return file.name;
  }

  function chargeOnBudget(srv, file) {
    var bName = budgetName(srv, file);
    var size = astSize(file.ast);
    var known = srv.budgets[bName];
    if (known == null)
      known = srv.budgets[bName] = srv.options.dependencyBudget;
    if (known < size) return false;
    srv.budgets[bName] = known - size;
    return true;
  }

  // Query helpers

  function isPosition(val) {
    return typeof val == "number" || typeof val == "object" &&
      typeof val.line == "number" && typeof val.ch == "number";
  }

  // Baseline query document validation
  function invalidDoc(doc) {
    if (doc.query) {
      if (typeof doc.query.type != "string") return ".query.type must be a string";
      if (doc.query.start && !isPosition(doc.query.start)) return ".query.start must be a position";
      if (doc.query.end && !isPosition(doc.query.end)) return ".query.end must be a position";
    }
    if (doc.files) {
      if (!Array.isArray(doc.files)) return "Files property must be an array";
      for (var i = 0; i < doc.files.length; ++i) {
        var file = doc.files[i];
        if (typeof file != "object") return ".files[n] must be objects";
        else if (typeof file.name != "string") return ".files[n].name must be a string";
        else if (file.type == "delete") continue;
        else if (typeof file.text != "string") return ".files[n].text must be a string";
        else if (file.type == "part") {
          if (!isPosition(file.offset) && typeof file.offsetLines != "number")
            return ".files[n].offset must be a position";
        } else if (file.type != "full") return ".files[n].type must be \"full\" or \"part\"";
      }
    }
  }

  var offsetSkipLines = 25;

  function forwardCharacters(file, start, chars) {
    var pos = start + chars, m;
    if (file.hasAstral) {
      astral.lastIndex = start;
      while ((m = astral.exec(file.text)) && m.index < pos) pos++;
    }
    return pos;
  }

  function findLineStart(file, line) {
    var text = file.text, offsets = file.lineOffsets || (file.lineOffsets = [0]);
    var pos = 0, curLine = 0;
    var storePos = Math.min(Math.floor(line / offsetSkipLines), offsets.length - 1);
    var pos = offsets[storePos], curLine = storePos * offsetSkipLines;

    while (curLine < line) {
      ++curLine;
      pos = text.indexOf("\n", pos) + 1;
      if (pos === 0) return null;
      if (curLine % offsetSkipLines === 0) offsets.push(pos);
    }
    return pos;
  }

  var resolvePos = exports.resolvePos = function(file, pos, tolerant) {
    if (typeof pos != "number") {
      var lineStart = findLineStart(file, pos.line);
      if (lineStart == null) {
        if (tolerant) pos = file.text.length;
        else throw ternError("File doesn't contain a line " + pos.line);
      } else {
        pos = forwardCharacters(file, lineStart, pos.ch);
      }
    } else {
      pos = forwardCharacters(file, 0, pos);
    }
    if (pos > file.text.length) {
      if (tolerant) pos = file.text.length;
      else throw ternError("Position " + pos + " is outside of file.");
    }
    return pos;
  };

  function charDistanceBetween(file, start, end) {
    var diff = end - start, m;
    if (file.hasAstral) {
      astral.lastIndex = start;
      while ((m = astral.exec(file.text)) && m.index < end) diff--;
    }
    return diff;
  }

  function asLineChar(file, pos) {
    if (!file) return {line: 0, ch: 0};
    var offsets = file.lineOffsets || (file.lineOffsets = [0]);
    var text = file.text, line, lineStart;
    for (var i = offsets.length - 1; i >= 0; --i) if (offsets[i] <= pos) {
      line = i * offsetSkipLines;
      lineStart = offsets[i];
    }
    for (;;) {
      var eol = text.indexOf("\n", lineStart);
      if (eol >= pos || eol < 0) break;
      lineStart = eol + 1;
      ++line;
    }
    return {line: line, ch: charDistanceBetween(file, lineStart, pos)};
  }

  var outputPos = exports.outputPos = function(query, file, pos) {
    if (query.lineCharPositions) {
      var out = asLineChar(file, pos);
      if (file.type == "part")
        out.line += file.offsetLines != null ? file.offsetLines : asLineChar(file.backing, file.offset).line;
      return out;
    } else {
      return charDistanceBetween(file, 0, pos) + (file.type == "part" ? file.offset : 0);
    }
  };

  // Delete empty fields from result objects
  function clean(obj) {
    for (var prop in obj) if (obj[prop] == null) delete obj[prop];
    return obj;
  }
  function maybeSet(obj, prop, val) {
    if (val != null) obj[prop] = val;
  }

  // Built-in query types

  function compareCompletions(a, b) {
    if (typeof a != "string") { a = a.name; b = b.name; }
    var aUp = /^[A-Z]/.test(a), bUp = /^[A-Z]/.test(b);
    if (aUp == bUp) return a < b ? -1 : a == b ? 0 : 1;
    else return aUp ? 1 : -1;
  }

  function isStringAround(node, start, end) {
    return node.type == "Literal" && typeof node.value == "string" &&
      node.start == start - 1 && node.end <= end + 1;
  }

  function pointInProp(objNode, point) {
    for (var i = 0; i < objNode.properties.length; i++) {
      var curProp = objNode.properties[i];
      if (curProp.key && curProp.key.start <= point && curProp.key.end >= point)
        return curProp;
    }
  }

  var jsKeywords = ("break do instanceof typeof case else new var " +
    "catch finally return void continue for switch while debugger " +
    "function this with default if throw delete in try").split(" ");
  var jsKeywordsES6 = jsKeywords.concat("export class extends const super yield import let static".split(" "));

  var addCompletion = exports.addCompletion = function(query, completions, name, aval, depth) {
    var typeInfo = query.types || query.docs || query.urls || query.origins;
    var wrapAsObjs = typeInfo || query.depths;

    for (var i = 0; i < completions.length; ++i) {
      var c = completions[i];
      if ((wrapAsObjs ? c.name : c) == name) return;
    }
    var rec = wrapAsObjs ? {name: name} : name;
    completions.push(rec);

    if (aval && typeInfo) {
      infer.resetGuessing();
      var type = aval.getType();
      rec.guess = infer.didGuess();
      if (query.types)
        rec.type = infer.toString(aval);
      if (query.docs)
        maybeSet(rec, "doc", parseDoc(query, aval.doc || type && type.doc));
      if (query.urls)
        maybeSet(rec, "url", aval.url || type && type.url);
      if (query.origins)
        maybeSet(rec, "origin", aval.origin || type && type.origin);
    }
    if (query.depths) rec.depth = depth || 0;
    return rec;
  };

  function findCompletions(srv, query, file) {
    if (query.end == null) throw ternError("missing .query.end field");
    var fromPlugin = srv.signalReturnFirst("completion", file, query);
    if (fromPlugin) return fromPlugin;

    var wordStart = resolvePos(file, query.end), wordEnd = wordStart, text = file.text;
    while (wordStart && acorn.isIdentifierChar(text.charCodeAt(wordStart - 1))) --wordStart;
    if (query.expandWordForward !== false)
      while (wordEnd < text.length && acorn.isIdentifierChar(text.charCodeAt(wordEnd))) ++wordEnd;
    var word = text.slice(wordStart, wordEnd), completions = [], ignoreObj;
    if (query.caseInsensitive) word = word.toLowerCase();

    function gather(prop, obj, depth, addInfo) {
      // 'hasOwnProperty' and such are usually just noise, leave them
      // out when no prefix is provided.
      if ((objLit || query.omitObjectPrototype !== false) && obj == srv.cx.protos.Object && !word) return;
      if (query.filter !== false && word &&
          (query.caseInsensitive ? prop.toLowerCase() : prop).indexOf(word) !== 0) return;
      if (ignoreObj && ignoreObj.props[prop]) return;
      var result = addCompletion(query, completions, prop, obj && obj.props[prop], depth);
      if (addInfo && result && typeof result != "string") addInfo(result);
    }

    var hookname, prop, objType, isKey;

    var exprAt = infer.findExpressionAround(file.ast, null, wordStart, file.scope);
    var memberExpr, objLit;
    // Decide whether this is an object property, either in a member
    // expression or an object literal.
    if (exprAt) {
      var exprNode = exprAt.node;

      if (query.inLiteral === false && exprNode.type === "Literal" &&
          (typeof exprNode.value === 'string' || exprNode.regex))
        return {
          start: outputPos(query, file, wordStart),
          end: outputPos(query, file, wordEnd),
          completions: []
        };

      if (exprNode.type == "MemberExpression" && exprNode.object.end < wordStart) {
        memberExpr = exprAt;
      } else if (isStringAround(exprNode, wordStart, wordEnd)) {
        var parent = infer.parentNode(exprNode, file.ast);
        if (parent.type == "MemberExpression" && parent.property == exprNode)
          memberExpr = {node: parent, state: exprAt.state};
      } else if (exprNode.type == "ObjectExpression") {
        var objProp = pointInProp(exprNode, wordEnd);
        if (objProp) {
          objLit = exprAt;
          prop = isKey = objProp.key.name || objProp.key.value;
        } else if (!word && !/:\s*$/.test(file.text.slice(0, wordStart))) {
          objLit = exprAt;
          prop = isKey = true;
        }
      }
    }

    if (objLit) {
      // Since we can't use the type of the literal itself to complete
      // its properties (it doesn't contain the information we need),
      // we have to try asking the surrounding expression for type info.
      objType = infer.typeFromContext(file.ast, objLit);
      ignoreObj = objLit.node.objType;
    } else if (memberExpr) {
      prop = memberExpr.node.property;
      prop = prop.type == "Literal" ? prop.value.slice(1) : prop.name;
      memberExpr.node = memberExpr.node.object;
      objType = infer.expressionType(memberExpr);
    } else if (text.charAt(wordStart - 1) == ".") {
      var pathStart = wordStart - 1;
      while (pathStart && (text.charAt(pathStart - 1) == "." || acorn.isIdentifierChar(text.charCodeAt(pathStart - 1)))) pathStart--;
      var path = text.slice(pathStart, wordStart - 1);
      if (path) {
        objType = infer.def.parsePath(path, file.scope).getObjType();
        prop = word;
      }
    }

    if (prop != null) {
      srv.cx.completingProperty = prop;

      if (objType) infer.forAllPropertiesOf(objType, gather);

      if (!completions.length && query.guess !== false && objType && objType.guessProperties)
        objType.guessProperties(function(p, o, d) {if (p != prop && p != "✖" && p != "<i>") gather(p, o, d);});
      if (!completions.length && word.length >= 2 && query.guess !== false)
        for (var prop in srv.cx.props) gather(prop, srv.cx.props[prop][0], 0);
      hookname = "memberCompletion";
    } else {
      infer.forAllLocalsAt(file.ast, wordStart, file.scope, gather);
      if (query.includeKeywords) {
        (srv.options.ecmaVersion >= 6 ? jsKeywordsES6 : jsKeywords).forEach(function(kw) {
          gather(kw, null, 0, function(rec) { rec.isKeyword = true; });
        });
      }
      hookname = "variableCompletion";
    }
    srv.signal(hookname, file, wordStart, wordEnd, gather);

    if (query.sort !== false) completions.sort(compareCompletions);
    srv.cx.completingProperty = null;

    return {start: outputPos(query, file, wordStart),
            end: outputPos(query, file, wordEnd),
            isProperty: !!prop,
            isObjectKey: !!isKey,
            completions: completions};
  }

  function findProperties(srv, query) {
    var prefix = query.prefix, found = [];
    for (var prop in srv.cx.props)
      if (prop != "<i>" && (!prefix || prop.indexOf(prefix) === 0)) found.push(prop);
    if (query.sort !== false) found.sort(compareCompletions);
    return {completions: found};
  }

  function inBody(node, pos) {
    var body = node.body, start, end;
    if (!body) return false;
    if (Array.isArray(body)) {
      start = body[0].start;
      end = body[body.length - 1].end;
    } else {
      start = body.start;
      end = body.end;
    }
    return start <= pos && end >= pos;
  }

  var findExpr = exports.findQueryExpr = function(file, query, wide) {
    if (query.end == null) throw ternError("missing .query.end field");

    if (query.variable) {
      var scope = infer.scopeAt(file.ast, resolvePos(file, query.end), file.scope);
      return {node: {type: "Identifier", name: query.variable, start: query.end, end: query.end + 1},
              state: scope};
    } else {
      var start = query.start && resolvePos(file, query.start), end = resolvePos(file, query.end);
      var expr = infer.findExpressionAt(file.ast, start, end, file.scope);
      if (!expr) {
        var span = infer.findClosestExpression(file.ast, start, end, file.scope);
        if (span && !inBody(span.node, end) &&
            (wide || (start == null ? end : start) - span.node.start < 20 || span.node.end - end < 20))
          expr = span;
      }
      if (!expr) {
        var around = infer.findExpressionAround(file.ast, start, end, file.scope);
        if (around && !inBody(around.node, end) &&
            (around.node.type == "ObjectExpression" || wide ||
             (start == null ? end : start) - around.node.start < 20 || around.node.end - end < 20))
          expr = around;
      }
      return expr;
    }
  };

  function findExprAround(file, query, wide) {
    var start = query.start && resolvePos(file, query.start), end = resolvePos(file, query.end);
    var expr = null;
    var around = infer.findExpressionAround(file.ast, start, end, file.scope);
    if (around && !inBody(around.node, end) &&
        (around.node.type == "ObjectExpression" || wide ||
         (start == null ? end : start) - around.node.start < 20 || around.node.end - end < 20))
      expr = around;
    return expr;
  }

  function findExprOrThrow(file, query, wide) {
    var expr = findExpr(file, query, wide);
    if (expr) return expr;
    throw ternError("No expression at the given position.");
  }

  function ensureObj(tp) {
    if (!tp || !(tp = tp.getType()) || !(tp instanceof infer.Obj)) return null;
    return tp;
  }

  function findExprType(srv, query, file, expr) {
    var type;
    if (expr) {
      infer.resetGuessing();
      type = infer.expressionType(expr);
    }
    var typeHandlers = srv.hasHandler("typeAt");
    if (typeHandlers) {
      var pos = resolvePos(file, query.end);
      for (var i = 0; i < typeHandlers.length; i++)
        type = typeHandlers[i](file, pos, expr, type);
    }
    if (!type) throw ternError("No type found at the given position.");

    var objProp;
    if (expr.node.type == "ObjectExpression" && query.end != null &&
        (objProp = pointInProp(expr.node, resolvePos(file, query.end)))) {
      var name = objProp.key.name;
      var fromCx = ensureObj(infer.typeFromContext(file.ast, expr));
      if (fromCx && fromCx.hasProp(name)) {
        type = fromCx.hasProp(name);
      } else {
        var fromLocal = ensureObj(type);
        if (fromLocal && fromLocal.hasProp(name))
          type = fromLocal.hasProp(name);
      }
    }
    return type;
  }

  function findTypeAtExpr(srv, query, file, expr) {
    var exprName, exprType;
    var type = findExprType(srv, query, file, expr), exprType = type;
    if (query.preferFunction)
      type = type.getFunctionType() || type.getType();
    else
      type = type.getType();

    if (expr) {
      if (expr.node.type == "Identifier")
        exprName = expr.node.name;
      else if (expr.node.type == "MemberExpression" && !expr.node.computed)
        exprName = expr.node.property.name;
      else if (expr.node.type == "MethodDefinition" && !expr.node.computed)
        exprName = expr.node.key.name;
    }

    if (query.depth != null && typeof query.depth != "number")
      throw ternError(".query.depth must be a number");

    return [type, exprName, exprType];
  }

  function findTypeAt(srv, query, file) {
    var type, exprName, exprType;
    var expr = findExpr(file, query);
    var typeResult = findTypeAtExpr(srv, query, file, expr);
    type = typeResult[0];
    if (!type) {
      expr = findExprAround(file, query);
      typeResult = findTypeAtExpr(srv, query, file, expr);
      type = typeResult[0];
    }
    exprName = typeResult[1];
    exprType = typeResult[2];

    var result = {guess: infer.didGuess(),
                  type: infer.toString(exprType, query.depth),
                  name: type && type.name,
                  exprName: exprName,
                  doc: exprType.doc,
                  url: exprType.url};
    if (type) storeTypeDocs(query, type, result);

    return clean(result);
  }

  function parseDoc(query, doc) {
    if (!doc) return null;
    if (query.docFormat == "full") return doc;
    var parabreak = /.\n[\s@\n]/.exec(doc);
    if (parabreak) doc = doc.slice(0, parabreak.index + 1);
    doc = doc.replace(/\n\s*/g, " ");
    if (doc.length < 100) return doc;
    var sentenceEnd = /[\.!?] [A-Z]/g;
    sentenceEnd.lastIndex = 80;
    var found = sentenceEnd.exec(doc);
    if (found) doc = doc.slice(0, found.index + 1);
    return doc;
  }

  function findDocs(srv, query, file) {
    var expr = findExpr(file, query);
    var type = findExprType(srv, query, file, expr);
    var inner = type.getType();
    if (!inner) {
      expr = findExprAround(file, query);
      type = findExprType(srv, query, file, expr);
      inner = type.getType();
    }
    var result = {url: type.url, doc: parseDoc(query, type.doc), type: infer.toString(type)};
    if (inner) storeTypeDocs(query, inner, result);
    return clean(result);
  }

  function storeTypeDocs(query, type, out) {
    if (!out.url) out.url = type.url;
    if (!out.doc) out.doc = parseDoc(query, type.doc);
    if (!out.origin) out.origin = type.origin;
    var ctor, boring = infer.cx().protos;
    if (!out.url && !out.doc && type.proto && (ctor = type.proto.hasCtor) &&
        type.proto != boring.Object && type.proto != boring.Function && type.proto != boring.Array) {
      out.url = ctor.url;
      out.doc = parseDoc(query, ctor.doc);
    }
  }

  var getSpan = exports.getSpan = function(obj) {
    if (!obj.origin) return;
    if (obj.originNode) {
      var node = obj.originNode;
      if (/^Function/.test(node.type) && node.id) node = node.id;
      return {origin: obj.origin, node: node};
    }
    if (obj.span) return {origin: obj.origin, span: obj.span};
  };

  var storeSpan = exports.storeSpan = function(srv, query, span, target) {
    target.origin = span.origin;
    if (span.span) {
      var m = /^(\d+)\[(\d+):(\d+)\]-(\d+)\[(\d+):(\d+)\]$/.exec(span.span);
      target.start = query.lineCharPositions ? {line: Number(m[2]), ch: Number(m[3])} : Number(m[1]);
      target.end = query.lineCharPositions ? {line: Number(m[5]), ch: Number(m[6])} : Number(m[4]);
    } else {
      var file = srv.fileMap[span.origin];
      target.start = outputPos(query, file, span.node.start);
      target.end = outputPos(query, file, span.node.end);
    }
  };

  function findDef(srv, query, file) {
    var expr = findExpr(file, query);
    var type = findExprType(srv, query, file, expr);
    if (infer.didGuess()) return {};

    var span = getSpan(type);
    var result = {url: type.url, doc: parseDoc(query, type.doc), origin: type.origin};

    if (type.types) for (var i = type.types.length - 1; i >= 0; --i) {
      var tp = type.types[i];
      storeTypeDocs(query, tp, result);
      if (!span) span = getSpan(tp);
    }

    if (span && span.node) { // refers to a loaded file
      var spanFile = span.node.sourceFile || srv.fileMap[span.origin];
      var start = outputPos(query, spanFile, span.node.start), end = outputPos(query, spanFile, span.node.end);
      result.start = start; result.end = end;
      result.file = span.origin;
      var cxStart = Math.max(0, span.node.start - 50);
      result.contextOffset = span.node.start - cxStart;
      result.context = spanFile.text.slice(cxStart, cxStart + 50);
    } else if (span) { // external
      result.file = span.origin;
      storeSpan(srv, query, span, result);
    }
    return clean(result);
  }

  function findRefsToVariable(srv, query, file, expr, isRename) {
    var name = expr.node.name;

    for (var scope = expr.state; scope && !(name in scope.props); scope = scope.prev) {}
    if (!scope) throw ternError("Could not find a definition for " + name);

    var type, refs = [];
    function storeRef(file) {
      return function(node, scopeHere, ancestors) {
        var value = {file: file.name,
                     start: outputPos(query, file, node.start),
                     end: outputPos(query, file, node.end)};
        if (isRename) {
          for (var s = scopeHere; s != scope; s = s.prev) {
            var exists = s.hasProp(isRename);
            if (exists)
              throw ternError("Renaming `" + name + "` to `" + isRename + "` would make a variable at line " +
                              (asLineChar(file, node.start).line + 1) + " point to the definition at line " +
                              (asLineChar(file, exists.name.start).line + 1));
          }
          var parent = ancestors[ancestors.length - 2];
          if (parent && parent.type == "Property" && parent.key == parent.value)
            value.isShorthand = true;
        }
        refs.push(value);
      };
    }

    if (scope.originNode) {
      type = "local";
      if (isRename) {
        for (var prev = scope.prev; prev; prev = prev.prev)
          if (isRename in prev.props) break;
        if (prev) infer.findRefs(scope.originNode, scope, isRename, prev, function(node) {
          throw ternError("Renaming `" + name + "` to `" + isRename + "` would shadow the definition used at line " +
                          (asLineChar(file, node.start).line + 1));
        });
      }
      infer.findRefs(scope.originNode, scope, name, scope, storeRef(file));
    } else {
      type = "global";
      if (query.onlySourceFile) {
        infer.findRefs(file.ast, file.scope, name, scope, storeRef(file));
      } else {
        for (var i = 0; i < srv.files.length; ++i) {
          var cur = srv.files[i];
          infer.findRefs(cur.ast, cur.scope, name, scope, storeRef(cur));
        }
      }
    }

    return {refs: refs, type: type, name: name};
  }

  function findRefsToProperty(srv, query, sourceFile, expr, prop) {
    var exprType = infer.expressionType(expr);
    if (expr.node.type == "MethodDefinition") {
      exprType = exprType.propertyOf;
    }
    var objType = exprType.getObjType();
    if (!objType) throw ternError("Couldn't determine type of base object.");

    var refs = [];
    function storeRef(file) {
      return function(node) {
        refs.push({file: file.name,
                   start: outputPos(query, file, node.start),
                   end: outputPos(query, file, node.end)});
      };
    }

    if (query.onlySourceFile) {
        infer.findPropRefs(sourceFile.ast, sourceFile.scope, objType, prop.name, storeRef(sourceFile));
    } else {
      for (var i = 0; i < srv.files.length; ++i) {
        var cur = srv.files[i];
        infer.findPropRefs(cur.ast, cur.scope, objType, prop.name, storeRef(cur));
      }
    }

    return {refs: refs, name: prop.name};
  }

  function findRefs(srv, query, file) {
    var expr = findExprOrThrow(file, query, true);
    if (expr && expr.node.type == "Identifier") {
      return findRefsToVariable(srv, query, file, expr);
    } else if (expr && expr.node.type == "MemberExpression" && !expr.node.computed) {
      var p = expr.node.property;
      expr.node = expr.node.object;
      return findRefsToProperty(srv, query, file, expr, p);
    } else if (expr && expr.node.type == "ObjectExpression") {
      var pos = resolvePos(file, query.end);
      for (var i = 0; i < expr.node.properties.length; ++i) {
        var k = expr.node.properties[i].key;
        if (k.start <= pos && k.end >= pos)
          return findRefsToProperty(srv, query, file, expr, k);
      }
    } else if (expr && expr.node.type == "MethodDefinition") {
      var p = expr.node.key;
      return findRefsToProperty(srv, query, file, expr, p);
    }
    throw ternError("Not at a variable or property name.");
  }

  function buildRename(srv, query, file) {
    if (typeof query.newName != "string") throw ternError(".query.newName should be a string");
    var expr = findExprOrThrow(file, query);
    if (!expr || expr.node.type != "Identifier") throw ternError("Not at a variable.");

    var data = findRefsToVariable(srv, query, file, expr, query.newName), refs = data.refs;
    delete data.refs;
    data.files = srv.files.map(function(f){return f.name;});

    var changes = data.changes = [];
    for (var i = 0; i < refs.length; ++i) {
      var use = refs[i];
      if (use.isShorthand) use.text = expr.node.name + ": " + query.newName;
      else use.text = query.newName;
      changes.push(use);
    }

    return data;
  }

  function listFiles(srv) {
    return {files: srv.files.map(function(f){return f.name;})};
  }

  exports.version = "0.24.3";
});
