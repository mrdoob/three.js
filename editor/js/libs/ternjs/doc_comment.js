// Parses comments above variable declarations, function declarations,
// and object properties as docstrings and JSDoc-style type
// annotations.

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    return mod(require("../lib/infer"), require("../lib/tern"), require("../lib/comment"),
               require("acorn"), require("acorn-walk"));
  if (typeof define == "function" && define.amd) // AMD
    return define(["../lib/infer", "../lib/tern", "../lib/comment", "acorn/dist/acorn", "acorn-walk/dist/walk"], mod);
  mod(tern, tern, tern.comment, acorn, acorn.walk);
})(function(infer, tern, comment, acorn, walk) {
  "use strict";

  var WG_MADEUP = 1, WG_STRONG = 101;

  tern.registerPlugin("doc_comment", function(server, options) {
    server.mod.jsdocTypedefs = Object.create(null);
    server.on("reset", function() {
      server.mod.jsdocTypedefs = Object.create(null);
    });
    server.mod.docComment = {
      weight: options && options.strong ? WG_STRONG : undefined,
      fullDocs: options && options.fullDocs
    };

    server.on("postParse", postParse);
    server.on("postInfer", postInfer);
    server.on("postLoadDef", postLoadDef);
  });

  function postParse(ast, text) {
    function attachComments(node) { comment.ensureCommentsBefore(text, node); }

    walk.simple(ast, {
      VariableDeclaration: attachComments,
      FunctionDeclaration: attachComments,
      MethodDefinition: attachComments,
      Property: attachComments,
      AssignmentExpression: function(node) {
        if (node.operator == "=") attachComments(node);
      },
      CallExpression: function(node) {
        if (isDefinePropertyCall(node)) attachComments(node);
      },
      ExportNamedDeclaration: attachComments,
      ExportDefaultDeclaration: attachComments,
      ClassDeclaration: attachComments
    });
  }

  function isDefinePropertyCall(node) {
    return node.callee.type == "MemberExpression" &&
      node.callee.object.name == "Object" &&
      node.callee.property.name == "defineProperty" &&
      node.arguments.length >= 3 &&
      typeof node.arguments[1].value == "string";
  }

  function postInfer(ast, scope) {
    jsdocParseTypedefs(ast.sourceFile.text, scope);

    walk.simple(ast, {
      VariableDeclaration: function(node, scope) {
        var decl = node.declarations[0].id;
        if (node.commentsBefore && decl.type == "Identifier")
          interpretComments(node, node.commentsBefore, scope,
                            scope.getProp(node.declarations[0].id.name));
      },
      FunctionDeclaration: function(node, scope) {
        if (node.commentsBefore)
          interpretComments(node, node.commentsBefore, scope,
                            scope.getProp(node.id.name),
                            node.scope.fnType);
      },
      ClassDeclaration: function(node, scope) {
        if (node.commentsBefore)
          interpretComments(node, node.commentsBefore, scope,
                            scope.getProp(node.id.name),
                            node.objType);
      },
      AssignmentExpression: function(node, scope) {
        if (node.commentsBefore)
          interpretComments(node, node.commentsBefore, scope,
                            infer.expressionType({node: node.left, state: scope}));
      },
      ObjectExpression: function(node, scope) {
        for (var i = 0; i < node.properties.length; ++i) {
          var prop = node.properties[i];
          if (prop.type == 'SpreadElement') { continue; }
          var name = infer.propName(prop);
          if (name != "<i>" && prop.commentsBefore)
            interpretComments(prop, prop.commentsBefore, scope, node.objType.getProp(name));
        }
      },
      Class: function(node, scope) {
        if (!node.objType) return;
        var proto = node.objType.getProp("prototype").getObjType();
        if (!proto) return;
        for (var i = 0; i < node.body.body.length; i++) {
          var method = node.body.body[i], name;
          if (!method.commentsBefore) continue;
          if (method.kind == "constructor")
            interpretComments(method, method.commentsBefore, scope, node.objType);
          else if ((name = infer.propName(method)) != "<i>")
            interpretComments(method, method.commentsBefore, scope, proto.getProp(name));
        }
      },
      CallExpression: function(node, scope) {
        if (node.commentsBefore && isDefinePropertyCall(node)) {
          var type = infer.expressionType({node: node.arguments[0], state: scope}).getObjType();
          if (type && type instanceof infer.Obj) {
            var prop = type.props[node.arguments[1].value];
            if (prop) interpretComments(node, node.commentsBefore, scope, prop);
          }
        }
      },
      ExportNamedDeclaration: function(node, scope) {
        if (node.commentsBefore && node.declaration && node.declaration.type === 'FunctionDeclaration') {
          interpretComments(node.declaration, node.commentsBefore, scope,
                            scope.getProp(node.declaration.id.name),
                            node.declaration.scope.fnType);
        }
      },
      ExportDefaultDeclaration: function(node, scope) {
        if (node.commentsBefore && node.declaration && node.declaration.type === 'FunctionDeclaration') {
          interpretComments(node.declaration, node.commentsBefore, scope,
                            scope.getProp(node.declaration.id.name),
                            node.declaration.scope.fnType);
        }
      }
    }, infer.searchVisitor, scope);
  }

  function postLoadDef(data) {
    var defs = data["!typedef"];
    var cx = infer.cx(), orig = data["!name"];
    if (defs) for (var name in defs)
      cx.parent.mod.jsdocTypedefs[name] =
        maybeInstance(infer.def.parse(defs[name], orig, name), name);
  }

  // COMMENT INTERPRETATION

  function stripLeadingChars(lines) {
    for (var head, i = 1; i < lines.length; i++) {
      var line = lines[i], lineHead = line.match(/^[\s\*]*/)[0];
      if (lineHead != line) {
        if (head == null) {
          head = lineHead;
        } else {
          var same = 0;
          while (same < head.length && head.charCodeAt(same) == lineHead.charCodeAt(same)) ++same;
          if (same < head.length) head = head.slice(0, same);
        }
      }
    }
    lines = lines.map(function(line, i) {
      line = line.replace(/\s+$/, "");
      if (i == 0 && head != null) {
        for (var j = 0; j < head.length; j++) {
          var found = line.indexOf(head.slice(j));
          if (found == 0) return line.slice(head.length - j);
        }
      }
      if (head == null || i == 0) return line.replace(/^[\s\*]*/, "");
      if (line.length < head.length) return "";
      return line.slice(head.length);
    });
    while (lines.length && !lines[lines.length - 1]) lines.pop();
    while (lines.length && !lines[0]) lines.shift();
    return lines;
  }

  function interpretComments(node, comments, scope, aval, type) {
    jsdocInterpretComments(node, scope, aval, comments);
    var cx = infer.cx();

    if (!type && aval instanceof infer.AVal && aval.types.length) {
      type = aval.types[aval.types.length - 1];
      if (!(type instanceof infer.Obj) || type.origin != cx.curOrigin || type.doc)
        type = null;
    }

    for (var i = comments.length - 1; i >= 0; i--) {
      var text = stripLeadingChars(comments[i].split(/\r\n?|\n/)).join("\n");
      if (text) {
        if (aval instanceof infer.AVal) aval.doc = text;
        if (type) type.doc = text;
        break;
      }
    }
  }

  // Parses a subset of JSDoc-style comments in order to include the
  // explicitly defined types in the analysis.

  function skipSpace(str, pos) {
    while (/\s/.test(str.charAt(pos))) ++pos;
    return pos;
  }

  function isIdentifier(string) {
    if (!acorn.isIdentifierStart(string.charCodeAt(0))) return false;
    for (var i = 1; i < string.length; i++)
      if (!acorn.isIdentifierChar(string.charCodeAt(i))) return false;
    return true;
  }

  function parseLabelList(scope, str, pos, close) {
    var labels = [], types = [], madeUp = false;
    for (var first = true; ; first = false) {
      pos = skipSpace(str, pos);
      if (first && str.charAt(pos) == close) break;
      var colon = str.indexOf(":", pos);
      if (colon < 0) return null;
      var label = str.slice(pos, colon);
      if (!isIdentifier(label)) return null;
      labels.push(label);
      pos = colon + 1;
      var type = parseType(scope, str, pos);
      if (!type) return null;
      pos = type.end;
      madeUp = madeUp || type.madeUp;
      types.push(type.type);
      pos = skipSpace(str, pos);
      var next = str.charAt(pos);
      ++pos;
      if (next == close) break;
      if (next != ",") return null;
    }
    return {labels: labels, types: types, end: pos, madeUp: madeUp};
  }

  function parseTypeAtom(scope, str, pos) {
    var result = parseTypeInner(scope, str, pos);
    if (!result) return null;
    if (str.slice(result.end, result.end + 2) == "[]")
      return {madeUp: result.madeUp, end: result.end + 2, type: new infer.Arr(result.type)};
    else return result;
  }

  function parseType(scope, str, pos) {
    var type, union = false, madeUp = false;
    for (;;) {
      var inner = parseTypeAtom(scope, str, pos);
      if (!inner) return null;
      madeUp = madeUp || inner.madeUp;
      if (union) inner.type.propagate(union);
      else type = inner.type;
      pos = skipSpace(str, inner.end);
      if (str.charAt(pos) != "|") break;
      pos++;
      if (!union) {
        union = new infer.AVal;
        type.propagate(union);
        type = union;
      }
    }
    var isOptional = false;
    if (str.charAt(pos) == "=") {
      ++pos;
      isOptional = true;
    }
    return {type: type, end: pos, isOptional: isOptional, madeUp: madeUp};
  }

  function parseTypeInner(scope, str, pos) {
    pos = skipSpace(str, pos);
    if (/[?!]/.test(str.charAt(pos))) pos++;
    var type, madeUp = false;

    if (str.indexOf("function(", pos) == pos) {
      var args = parseLabelList(scope, str, pos + 9, ")"), ret = infer.ANull;
      if (!args) return null;
      pos = skipSpace(str, args.end);
      if (str.charAt(pos) == ":") {
        ++pos;
        var retType = parseType(scope, str, pos + 1);
        if (!retType) return null;
        pos = retType.end;
        ret = retType.type;
        madeUp = retType.madeUp;
      }
      type = new infer.Fn(null, infer.ANull, args.types, args.labels, ret);
    } else if (str.charAt(pos) == "[") {
      var inner = parseType(scope, str, pos + 1);
      if (!inner) return null;
      pos = skipSpace(str, inner.end);
      madeUp = inner.madeUp;
      if (str.charAt(pos) != "]") return null;
      ++pos;
      type = new infer.Arr(inner.type);
    } else if (str.charAt(pos) == "{") {
      var fields = parseLabelList(scope, str, pos + 1, "}");
      if (!fields) return null;
      type = new infer.Obj(true);
      for (var i = 0; i < fields.types.length; ++i) {
        var field = type.defProp(fields.labels[i]);
        field.initializer = true;
        fields.types[i].propagate(field);
      }
      pos = fields.end;
      madeUp = fields.madeUp;
    } else if (str.charAt(pos) == "(") {
      var inner = parseType(scope, str, pos + 1);
      if (!inner) return null;
      pos = skipSpace(str, inner.end);
      if (str.charAt(pos) != ")") return null;
      ++pos;
      type = inner.type;
    } else {
      var start = pos;
      if (!acorn.isIdentifierStart(str.charCodeAt(pos))) return null;
      while (acorn.isIdentifierChar(str.charCodeAt(pos))) ++pos;
      if (start == pos) return null;
      var word = str.slice(start, pos);
      if (/^(number|integer)$/i.test(word)) type = infer.cx().num;
      else if (/^bool(ean)?$/i.test(word)) type = infer.cx().bool;
      else if (/^string$/i.test(word)) type = infer.cx().str;
      else if (/^(null|undefined)$/i.test(word)) type = infer.ANull;
      else if (/^array$/i.test(word)) {
        var inner = null;
        if (str.charAt(pos) == "." && str.charAt(pos + 1) == "<") {
          var inAngles = parseType(scope, str, pos + 2);
          if (!inAngles) return null;
          pos = skipSpace(str, inAngles.end);
          madeUp = inAngles.madeUp;
          if (str.charAt(pos++) != ">") return null;
          inner = inAngles.type;
        }
        type = new infer.Arr(inner);
      } else if (/^object$/i.test(word)) {
        type = new infer.Obj(true);
        if (str.charAt(pos) == "." && str.charAt(pos + 1) == "<") {
          var key = parseType(scope, str, pos + 2);
          if (!key) return null;
          pos = skipSpace(str, key.end);
          if (str.charAt(pos++) != ",") return null;
          var val = parseType(scope, str, pos);
          if (!val) return null;
          pos = skipSpace(str, val.end);
          madeUp = key.madeUp || val.madeUp;
          if (str.charAt(pos++) != ">") return null;
          val.type.propagate(type.defProp("<i>"));
        }
      } else {
        while (str.charCodeAt(pos) == 46 ||
               acorn.isIdentifierChar(str.charCodeAt(pos))) ++pos;
        var path = str.slice(start, pos);
        var cx = infer.cx(), defs = cx.parent && cx.parent.mod.jsdocTypedefs, found;
        if (defs && (path in defs)) {
          type = defs[path];
        } else if (found = infer.def.parsePath(path, scope).getObjType()) {
          type = maybeInstance(found, path);
        } else {
          if (!cx.jsdocPlaceholders) cx.jsdocPlaceholders = Object.create(null);
          if (!(path in cx.jsdocPlaceholders))
            type = cx.jsdocPlaceholders[path] = new infer.Obj(null, path);
          else
            type = cx.jsdocPlaceholders[path];
          madeUp = true;
        }
      }
    }

    return {type: type, end: pos, madeUp: madeUp};
  }

  function maybeInstance(type, path) {
    if (type instanceof infer.Fn && /(?:^|\.)[A-Z][^\.]*$/.test(path)) {
      var proto = type.getProp("prototype").getObjType();
      if (proto instanceof infer.Obj) return infer.getInstance(proto);
    }
    return type;
  }

  function parseTypeOuter(scope, str, pos) {
    pos = skipSpace(str, pos || 0);
    if (str.charAt(pos) != "{") return null;
    var result = parseType(scope, str, pos + 1);
    if (!result) return null;
    var end = skipSpace(str, result.end);
    if (str.charAt(end) != "}") return null;
    result.end = end + 1;
    return result;
  }

  function jsdocInterpretComments(node, scope, aval, comments) {
    var type, args, ret, foundOne, self, parsed;

    for (var i = 0; i < comments.length; ++i) {
      var comment = comments[i];
      var decl = /(?:\n|\*)\s*@(type|param|arg(?:ument)?|returns?|this|class|constructor)(?:\s*?\n|\s+(.*))/g, m;
      while (m = decl.exec(comment)) {
        if (m[1] == "class" || m[1] == "constructor") {
          self = foundOne = true;
          continue;
        }

        if (m[2] === undefined) continue; // to avoid tags that require a type argument.

        if (m[1] == "this" && (parsed = parseType(scope, m[2], 0))) {
          self = parsed;
          foundOne = true;
          continue;
        }

        if (!(parsed = parseTypeOuter(scope, m[2]))) continue;
        foundOne = true;

        switch(m[1]) {
        case "returns": case "return":
          ret = parsed; break;
        case "type":
          type = parsed; break;
        case "param": case "arg": case "argument":
            // Possible jsdoc param name situations:
            // employee
            // [employee]
            // [employee=John Doe]
            // employee.name
            // employees[].name
            var name = m[2].slice(parsed.end).match(/^\s*(\[?)\s*([^\[\]\s=]+(\[\][^\[\]\s=]+)?)\s*(?:=[^\]]+\s*)?(\]?).*/);
            if (!name) continue;
            var argname = name[2] + (parsed.isOptional || (name[1] === '[' && name[4] === ']') ? "?" : "");

            // Check to see if the jsdoc is indicating a property of a previously documented parameter
            var isObjProp = false;
            var parts = argname.split('.');
            if (args && parts.length == 2) {
              var objname = parts[0];
              argname = parts[1];

              // Go through each of the previously found parameter to find the
              // object or array for which this new parameter should be a part
              // of
              var key, value;
              for (key in args) {
                value = args[key];

                if (key === objname && value.type instanceof infer.Obj) {
                  isObjProp = true;
                  parsed.type.propagate(value.type.defProp(argname));
                }
                else if (key + '[]' === objname && value.type instanceof infer.Arr) {
                  isObjProp = true;
                  parsed.type.propagate(value.type.getProp("<i>").getType().defProp(argname));
                }
              }
            }
            if (!isObjProp) {
              (args || (args = Object.create(null)))[argname] = parsed;
            }
          break;
        }
      }
    }

    if (foundOne) applyType(type, self, args, ret, node, aval);
  }

  function jsdocParseTypedefs(text, scope) {
    var cx = infer.cx();

    var re = /\s@typedef\s+(.*)/g, m;
    while (m = re.exec(text)) {
      var parsed = parseTypeOuter(scope, m[1]);
      var name = parsed && m[1].slice(parsed.end).match(/^\s*(\S+)/);
      if (name && parsed.type instanceof infer.Obj) {
        var rest = text.slice(m.index + m[0].length);
        while (m = /\s+@prop(?:erty)?\s+(.*)/.exec(rest)) {
          var propType = parseTypeOuter(scope, m[1]), propName;
          if (propType && (propName = m[1].slice(propType.end).match(/^\s*(\S+)/)))
            propType.type.propagate(parsed.type.defProp(propName[1]));
          rest = rest.slice(m[0].length);
        }
        cx.parent.mod.jsdocTypedefs[name[1]] = parsed.type;
      }
    }
  }

  function propagateWithWeight(type, target) {
    var weight = infer.cx().parent.mod.docComment.weight;
    type.type.propagate(target, weight || (type.madeUp ? WG_MADEUP : undefined));
  }

  function isFunExpr(node) { return node.type == "FunctionExpression" || node.type == "ArrowFunctionExpression" }

  function applyType(type, self, args, ret, node, aval) {
    var fn;
    if (node.type == "VariableDeclaration") {
      var decl = node.declarations[0];
      if (decl.init && isFunExpr(decl.init)) fn = decl.init.scope.fnType;
    } else if (node.type == "FunctionDeclaration") {
      fn = node.scope.fnType;
    } else if (node.type == "AssignmentExpression") {
      if (isFunExpr(node.right))
        fn = node.right.scope.fnType;
    } else if (node.type == "CallExpression" || node.type === "ClassDeclaration") {
    } else { // An object property
      if (isFunExpr(node.value)) fn = node.value.scope.fnType;
    }

    if (fn && (args || ret || self)) {
      if (args) for (var i = 0; i < fn.argNames.length; ++i) {
        var name = fn.argNames[i], known = args[name];
        if (!known && (known = args[name + "?"]))
          fn.argNames[i] += "?";
        if (known) propagateWithWeight(known, fn.args[i]);
      }
      if (ret) {
        if (fn.retval == infer.ANull) fn.retval = new infer.AVal;
        propagateWithWeight(ret, fn.retval);
      }
      if (self === true) {
        var proto = fn.getProp("prototype").getObjType();
        self = proto && {type: infer.getInstance(proto, fn)};
      }
      if (self) propagateWithWeight(self, fn.self);
    } else if (type) {
      propagateWithWeight(type, aval);
    }
  }
});
