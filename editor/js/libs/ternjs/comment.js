(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    return mod(exports);
  if (typeof define == "function" && define.amd) // AMD
    return define(["exports"], mod);
  mod(tern.comment || (tern.comment = {}));
})(function(exports) {
  function isSpace(ch) {
    return (ch < 14 && ch > 8) || ch === 32 || ch === 160;
  }

  function onOwnLine(text, pos) {
    for (; pos > 0; --pos) {
      var ch = text.charCodeAt(pos - 1);
      if (ch == 10) break;
      if (!isSpace(ch)) return false;
    }
    return true;
  }

  // Gather comments directly before a function
  exports.commentsBefore = function(text, pos) {
    var found = null, emptyLines = 0, topIsLineComment;
    out: while (pos > 0) {
      var prev = text.charCodeAt(pos - 1);
      if (prev == 10) {
        for (var scan = --pos, sawNonWS = false; scan > 0; --scan) {
          prev = text.charCodeAt(scan - 1);
          if (prev == 47 && text.charCodeAt(scan - 2) == 47) {
            if (!onOwnLine(text, scan - 2)) break out;
            var content = text.slice(scan, pos);
            if (!emptyLines && topIsLineComment) found[0] = content + "\n" + found[0];
            else (found || (found = [])).unshift(content);
            topIsLineComment = true;
            emptyLines = 0;
            pos = scan - 2;
            break;
          } else if (prev == 10) {
            if (!sawNonWS && ++emptyLines > 1) break out;
            break;
          } else if (!sawNonWS && !isSpace(prev)) {
            sawNonWS = true;
          }
        }
      } else if (prev == 47 && text.charCodeAt(pos - 2) == 42) {
        for (var scan = pos - 2; scan > 1; --scan) {
          if (text.charCodeAt(scan - 1) == 42 && text.charCodeAt(scan - 2) == 47) {
            if (!onOwnLine(text, scan - 2)) break out;
            (found || (found = [])).unshift(text.slice(scan, pos - 2));
            topIsLineComment = false;
            emptyLines = 0;
            break;
          }
        }
        pos = scan - 2;
      } else if (isSpace(prev)) {
        --pos;
      } else {
        break;
      }
    }
    return found;
  };

  exports.commentAfter = function(text, pos) {
    while (pos < text.length) {
      var next = text.charCodeAt(pos);
      if (next == 47) {
        var after = text.charCodeAt(pos + 1), end;
        if (after == 47) // line comment
          end = text.indexOf("\n", pos + 2);
        else if (after == 42) // block comment
          end = text.indexOf("*/", pos + 2);
        else
          return;
        return text.slice(pos + 2, end < 0 ? text.length : end);
      } else if (isSpace(next)) {
        ++pos;
      }
    }
  };

  exports.ensureCommentsBefore = function(text, node) {
    if (node.hasOwnProperty("commentsBefore")) return node.commentsBefore;
    return node.commentsBefore = exports.commentsBefore(text, node.start);
  };
});
