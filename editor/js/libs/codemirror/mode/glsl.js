// Full source: 
//
// 		https://github.com/hughsk/glsl-editor 
//
// (C) Copyright Hugh Kennedy
//
// This software is released under the MIT license:
//
// Permission is hereby granted, free of charge, to any person obtaining a 
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEAL-
// INGS IN THE SOFTWARE.

// The original source code has been slightly modified for the purpose of
// integration (tschw).

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

  CodeMirror.defineMode("glsl", function(config, parserConfig) {
    var indentUnit = config.indentUnit,
        keywords = parserConfig.keywords || words(glslKeywords),
        builtins = parserConfig.builtins || words(glslBuiltins),
        blockKeywords = parserConfig.blockKeywords || words("case do else for if switch while struct"),
        atoms = parserConfig.atoms || words("null"),
        hooks = parserConfig.hooks || {},
        multiLineStrings = parserConfig.multiLineStrings;
    var isOperatorChar = /[+\-*&%=<>!?|\/]/;

    var curPunc;

    function tokenBase(stream, state) {
      var ch = stream.next();
      if (hooks[ch]) {
        var result = hooks[ch](stream, state);
        if (result !== false) return result;
      }
      if (ch == '"' || ch == "'") {
        state.tokenize = tokenString(ch);
        return state.tokenize(stream, state);
      }
      if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
        curPunc = ch;
        return "bracket";
      }
      if (/\d/.test(ch)) {
        stream.eatWhile(/[\w\.]/);
        return "number";
      }
      if (ch == "/") {
        if (stream.eat("*")) {
          state.tokenize = tokenComment;
          return tokenComment(stream, state);
        }
        if (stream.eat("/")) {
          stream.skipToEnd();
          return "comment";
        }
      }
      if (ch == "#") {
        stream.eatWhile(/[\S]+/);
        stream.eatWhile(/[\s]+/);
        stream.eatWhile(/[\S]+/);
        stream.eatWhile(/[\s]+/);
        return "comment";
      }
      if (isOperatorChar.test(ch)) {
        stream.eatWhile(isOperatorChar);
        return "operator";
      }
      stream.eatWhile(/[\w\$_]/);
      var cur = stream.current();
      if (keywords.propertyIsEnumerable(cur)) {
        if (blockKeywords.propertyIsEnumerable(cur)) curPunc = "newstatement";
        return "keyword";
      }
      if (builtins.propertyIsEnumerable(cur)) {
        return "builtin";
      }
      if (atoms.propertyIsEnumerable(cur)) return "atom";
      return "word";
    }

    function tokenString(quote) {
      return function(stream, state) {
        var escaped = false, next, end = false;
        while ((next = stream.next()) != null) {
          if (next == quote && !escaped) {end = true; break;}
          escaped = !escaped && next == "\\";
        }
        if (end || !(escaped || multiLineStrings))
          state.tokenize = tokenBase;
        return "string";
      };
    }

    function tokenComment(stream, state) {
      var maybeEnd = false, ch;
      while (ch = stream.next()) {
        if (ch == "/" && maybeEnd) {
          state.tokenize = tokenBase;
          break;
        }
        maybeEnd = (ch == "*");
      }
      return "comment";
    }

    function Context(indented, column, type, align, prev) {
      this.indented = indented;
      this.column = column;
      this.type = type;
      this.align = align;
      this.prev = prev;
    }
    function pushContext(state, col, type) {
      return state.context = new Context(state.indented, col, type, null, state.context);
    }
    function popContext(state) {
      var t = state.context.type;
      if (t == ")" || t == "]" || t == "}")
        state.indented = state.context.indented;
      return state.context = state.context.prev;
    }

    // Interface

    return {
      startState: function(basecolumn) {
        return {
          tokenize: null,
          context: new Context((basecolumn || 0) - indentUnit, 0, "top", false),
          indented: 0,
          startOfLine: true
        };
      },

      token: function(stream, state) {
        var ctx = state.context;
        if (stream.sol()) {
          if (ctx.align == null) ctx.align = false;
          state.indented = stream.indentation();
          state.startOfLine = true;
        }
        if (stream.eatSpace()) return null;
        curPunc = null;
        var style = (state.tokenize || tokenBase)(stream, state);
        if (style == "comment" || style == "meta") return style;
        if (ctx.align == null) ctx.align = true;

        if ((curPunc == ";" || curPunc == ":") && ctx.type == "statement") popContext(state);
        else if (curPunc == "{") pushContext(state, stream.column(), "}");
        else if (curPunc == "[") pushContext(state, stream.column(), "]");
        else if (curPunc == "(") pushContext(state, stream.column(), ")");
        else if (curPunc == "}") {
          while (ctx.type == "statement") ctx = popContext(state);
          if (ctx.type == "}") ctx = popContext(state);
          while (ctx.type == "statement") ctx = popContext(state);
        }
        else if (curPunc == ctx.type) popContext(state);
        else if (ctx.type == "}" || ctx.type == "top" || (ctx.type == "statement" && curPunc == "newstatement"))
          pushContext(state, stream.column(), "statement");
        state.startOfLine = false;
        return style;
      },

      indent: function(state, textAfter) {
        if (state.tokenize != tokenBase && state.tokenize != null) return 0;
        var firstChar = textAfter && textAfter.charAt(0), ctx = state.context, closing = firstChar == ctx.type;
        if (ctx.type == "statement") return ctx.indented + (firstChar == "{" ? 0 : indentUnit);
        else if (ctx.align) return ctx.column + (closing ? 0 : 1);
        else return ctx.indented + (closing ? 0 : indentUnit);
      },

      electricChars: "{}"
    };
  });

  function words(str) {
    var obj = {}, words = str.split(" ");
    for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
  }
  var glslKeywords = "attribute const uniform varying break continue " +
    "do for while if else in out inout float int void bool true false " +
    "lowp mediump highp precision invariant discard return mat2 mat3 " +
    "mat4 vec2 vec3 vec4 ivec2 ivec3 ivec4 bvec2 bvec3 bvec4 sampler2D " +
    "samplerCube struct gl_FragCoord gl_FragColor";
  var glslBuiltins = "radians degrees sin cos tan asin acos atan pow " +
    "exp log exp2 log2 sqrt inversesqrt abs sign floor ceil fract mod " +
    "min max clamp mix step smoothstep length distance dot cross " +
    "normalize faceforward reflect refract matrixCompMult lessThan " +
    "lessThanEqual greaterThan greaterThanEqual equal notEqual any all " +
    "not dFdx dFdy fwidth texture2D texture2DProj texture2DLod " +
    "texture2DProjLod textureCube textureCubeLod require export";

  function cppHook(stream, state) {
    if (!state.startOfLine) return false;
    stream.skipToEnd();
    return "meta";
  }

  ;(function() {
    // C#-style strings where "" escapes a quote.
    function tokenAtString(stream, state) {
      var next;
      while ((next = stream.next()) != null) {
        if (next == '"' && !stream.eat('"')) {
          state.tokenize = null;
          break;
        }
      }
      return "string";
    }

    CodeMirror.defineMIME("text/x-glsl", {
      name: "glsl",
      keywords: words(glslKeywords),
      builtins: words(glslBuiltins),
      blockKeywords: words("case do else for if switch while struct"),
      atoms: words("null"),
      hooks: {"#": cppHook}
    });
  }());
});
