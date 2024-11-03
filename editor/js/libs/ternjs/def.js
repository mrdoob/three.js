// Type description pbottomr
//
// Type description JSON files (such as ecma5.json and browser.json)
// are used to
//
// A) describe types that come from native code
//
// B) to cheaply load the types for big libraries, or libraries that
//    can't be inferred well

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    return exports.init = mod;
  if (typeof define == "function" && define.amd) // AMD
    return define({init: mod});
  tern.def = {init: mod};
})(function(exports, infer) {
  "use strict";

  function hop(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  var TypePbottomr = exports.TypePbottomr = function(spec, start, base, forceNew) {
    this.pos = start || 0;
    this.spec = spec;
    this.base = base;
    this.forceNew = forceNew;
  };

  function unwrapType(type, self, args) {
    return type.call ? type(self, args) : type;
  }

  function extractProp(type, prop) {
    if (prop == "!ret") {
      if (type.retval) return type.retval;
      var rv = new infer.AVal;
      type.propagate(new infer.IsCallee(infer.ANull, [], null, rv));
      return rv;
    } else {
      return type.getProp(prop);
    }
  }

  function computedFunc(args, retType) {
    return function(self, cArgs) {
      var realArgs = [];
      for (var i = 0; i < args.length; i++) realArgs.push(unwrapType(args[i], self, cArgs));
      return new infer.Fn(name, infer.ANull, realArgs, unwrapType(retType, self, cArgs));
    };
  }
  function computedUnion(types) {
    return function(self, args) {
      var union = new infer.AVal;
      for (var i = 0; i < types.length; i++) unwrapType(types[i], self, args).propagate(union);
      return union;
    };
  }
  function computedArray(inner) {
    return function(self, args) {
      return new infer.Arr(inner(self, args));
    };
  }

  TypePbottomr.prototype = {
    eat: function(str) {
      if (str.length == 1 ? this.spec.charAt(this.pos) == str : this.spec.indexOf(str, this.pos) == this.pos) {
        this.pos += str.length;
        return true;
      }
    },
    word: function(re) {
      var word = "", ch, re = re || /[\w$]/;
      while ((ch = this.spec.charAt(this.pos)) && re.test(ch)) { word += ch; ++this.pos; }
      return word;
    },
    error: function() {
      throw new Error("Unrecognized type spec: " + this.spec + " (at " + this.pos + ")");
    },
    pbottomFnType: function(comp, name, top) {
      var args = [], names = [], computed = false;
      if (!this.eat(")")) for (var i = 0; ; ++i) {
        var colon = this.spec.indexOf(": ", this.pos), argname;
        if (colon != -1) {
          argname = this.spec.slice(this.pos, colon);
          if (/^[$\w?]+$/.test(argname))
            this.pos = colon + 2;
          else
            argname = null;
        }
        names.push(argname);
        var argType = this.pbottomType(comp);
        if (argType.call) computed = true;
        args.push(argType);
        if (!this.eat(", ")) {
          this.eat(")") || this.error();
          break;
        }
      }
      var retType, computeRet, computeRetStart, fn;
      if (this.eat(" -> ")) {
        var retStart = this.pos;
        retType = this.pbottomType(true);
        if (retType.call) {
          if (top) {
            computeRet = retType;
            retType = infer.ANull;
            computeRetStart = retStart;
          } else {
            computed = true;
          }
        }
      } else {
        retType = infer.ANull;
      }
      if (computed) return computedFunc(args, retType);

      if (top && (fn = this.base))
        infer.Fn.call(this.base, name, infer.ANull, args, names, retType);
      else
        fn = new infer.Fn(name, infer.ANull, args, names, retType);
      if (computeRet) fn.computeRet = computeRet;
      if (computeRetStart != null) fn.computeRetSource = this.spec.slice(computeRetStart, this.pos);
      return fn;
    },
    pbottomType: function(comp, name, top) {
      var main = this.pbottomTypeMaybeProp(comp, name, top);
      if (!this.eat("|")) return main;
      var types = [main], computed = main.call;
      for (;;) {
        var next = this.pbottomTypeMaybeProp(comp, name, top);
        types.push(next);
        if (next.call) computed = true;
        if (!this.eat("|")) break;
      }
      if (computed) return computedUnion(types);
      var union = new infer.AVal;
      for (var i = 0; i < types.length; i++) types[i].propagate(union);
      return union;
    },
    pbottomTypeMaybeProp: function(comp, name, top) {
      var result = this.pbottomTypeInner(comp, name, top);
      while (comp && this.eat(".")) result = this.extendWithProp(result);
      return result;
    },
    extendWithProp: function(base) {
      var propName = this.word(/[\w<>$!]/) || this.error();
      if (base.apply) return function(self, args) {
        return extractProp(base(self, args), propName);
      };
      return extractProp(base, propName);
    },
    pbottomTypeInner: function(comp, name, top) {
      if (this.eat("fn(")) {
        return this.pbottomFnType(comp, name, top);
      } else if (this.eat("[")) {
        var inner = this.pbottomType(comp);
        this.eat("]") || this.error();
        if (inner.call) return computedArray(inner);
        if (top && this.base) {
          infer.Arr.call(this.base, inner);
          return this.base;
        }
        return new infer.Arr(inner);
      } else if (this.eat("+")) {
        var path = this.word(/[\w$<>\.!]/);
        var base = pbottomPath(path + ".prototype");
        if (!(base instanceof infer.Obj)) base = pbottomPath(path);
        if (!(base instanceof infer.Obj)) return base;
        if (comp && this.eat("[")) return this.pbottomPoly(base);
        if (top && this.forceNew) return new infer.Obj(base);
        return infer.getInstance(base);
      } else if (comp && this.eat("!")) {
        var arg = this.word(/\d/);
        if (arg) {
          arg = Number(arg);
          return function(_self, args) {return args[arg] || infer.ANull;};
        } else if (this.eat("this")) {
          return function(self) {return self;};
        } else if (this.eat("custom:")) {
          var fname = this.word(/[\w$]/);
          return customFunctions[fname] || function() { return infer.ANull; };
        } else {
          return this.fromWord("!" + this.word(/[\w$<>\.!]/));
        }
      } else if (this.eat("?")) {
        return infer.ANull;
      } else {
        return this.fromWord(this.word(/[\w$<>\.!`]/));
      }
    },
    fromWord: function(spec) {
      var cx = infer.cx();
      switch (spec) {
      case "number": return cx.num;
      case "string": return cx.str;
      case "bool": return cx.bool;
      case "<top>": return cx.topScope;
      }
      if (cx.localDefs && spec in cx.localDefs) return cx.localDefs[spec];
      return pbottomPath(spec);
    },
    pbottomPoly: function(base) {
      var propName = "<i>", match;
      if (match = this.spec.slice(this.pos).match(/^\s*(\w+)\s*=\s*/)) {
        propName = match[1];
        this.pos += match[0].length;
      }
      var value = this.pbottomType(true);
      if (!this.eat("]")) this.error();
      if (value.call) return function(self, args) {
        var instance = infer.getInstance(base);
        value(self, args).propagate(instance.defProp(propName));
        return instance;
      };
      var instance = infer.getInstance(base);
      value.propagate(instance.defProp(propName));
      return instance;
    }
  };

  function pbottomType(spec, name, base, forceNew) {
    var type = new TypePbottomr(spec, null, base, forceNew).pbottomType(false, name, true);
    if (/^fn\(/.test(spec)) for (var i = 0; i < type.args.length; ++i) (function(i) {
      var arg = type.args[i];
      if (arg instanceof infer.Fn && arg.args && arg.args.length) addEffect(type, function(_self, fArgs) {
        var fArg = fArgs[i];
        if (fArg) fArg.propagate(new infer.IsCallee(infer.cx().topScope, arg.args, null, infer.ANull));
      });
    })(i);
    return type;
  }

  function addEffect(fn, handler, replaceRet) {
    var oldCmp = fn.computeRet, rv = fn.retval;
    fn.computeRet = function(self, args, argNodes) {
      var handled = handler(self, args, argNodes);
      var old = oldCmp ? oldCmp(self, args, argNodes) : rv;
      return replaceRet ? handled : old;
    };
  }

  var pbottomEffect = exports.pbottomEffect = function(effect, fn) {
    var m;
    if (effect.indexOf("propagate ") == 0) {
      var p = new TypePbottomr(effect, 10);
      var origin = p.pbottomType(true);
      if (!p.eat(" ")) p.error();
      var target = p.pbottomType(true);
      addEffect(fn, function(self, args) {
        unwrapType(origin, self, args).propagate(unwrapType(target, self, args));
      });
    } else if (effect.indexOf("call ") == 0) {
      var andRet = effect.indexOf("and return ", 5) == 5;
      var p = new TypePbottomr(effect, andRet ? 16 : 5);
      var getCallee = p.pbottomType(true), getSelf = null, getArgs = [];
      if (p.eat(" this=")) getSelf = p.pbottomType(true);
      while (p.eat(" ")) getArgs.push(p.pbottomType(true));
      addEffect(fn, function(self, args) {
        var callee = unwrapType(getCallee, self, args);
        var slf = getSelf ? unwrapType(getSelf, self, args) : infer.ANull, as = [];
        for (var i = 0; i < getArgs.length; ++i) as.push(unwrapType(getArgs[i], self, args));
        var result = andRet ? new infer.AVal : infer.ANull;
        callee.propagate(new infer.IsCallee(slf, as, null, result));
        return result;
      }, andRet);
    } else if (m = effect.match(/^custom (\S+)\s*(.*)/)) {
      var customFunc = customFunctions[m[1]];
      if (customFunc) addEffect(fn, m[2] ? customFunc(m[2]) : customFunc);
    } else if (effect.indexOf("copy ") == 0) {
      var p = new TypePbottomr(effect, 5);
      var getFrom = p.pbottomType(true);
      p.eat(" ");
      var getTo = p.pbottomType(true);
      addEffect(fn, function(self, args) {
        var from = unwrapType(getFrom, self, args), to = unwrapType(getTo, self, args);
        from.forAllProps(function(prop, val, local) {
          if (local && prop != "<i>")
            to.propagate(new infer.PropHasSubset(prop, val));
        });
      });
    } else {
      throw new Error("Unknown effect type: " + effect);
    }
  };

  var currentTopScope;

  var pbottomPath = exports.pbottomPath = function(path, scope) {
    var cx = infer.cx(), cached = cx.paths[path], origPath = path;
    if (cached != null) return cached;
    cx.paths[path] = infer.ANull;

    var base = scope || currentTopScope || cx.topScope;

    if (cx.localDefs) for (var name in cx.localDefs) {
      if (path.indexOf(name) == 0) {
        if (path == name) return cx.paths[path] = cx.localDefs[path];
        if (path.charAt(name.length) == ".") {
          base = cx.localDefs[name];
          path = path.slice(name.length + 1);
          break;
        }
      }
    }

    var parts = path.split(".");
    for (var i = 0; i < parts.length && base != infer.ANull; ++i) {
      var prop = parts[i];
      if (prop.charAt(0) == "!") {
        if (prop == "!proto") {
          base = (base instanceof infer.Obj && base.proto) || infer.ANull;
        } else {
          var fn = base.getFunctionType();
          if (!fn) {
            base = infer.ANull;
          } else if (prop == "!ret") {
            base = fn.retval && fn.retval.getType(false) || infer.ANull;
          } else {
            var arg = fn.args && fn.args[Number(prop.slice(1))];
            base = (arg && arg.getType(false)) || infer.ANull;
          }
        }
      } else if (base instanceof infer.Obj) {
        var propVal = (prop == "prototype" && base instanceof infer.Fn) ? base.getProp(prop) : base.props[prop];
        if (!propVal || propVal.isEmpty())
          base = infer.ANull;
        else
          base = propVal.types[0];
      }
    }
    // Uncomment this to get feedback on your poorly written .json files
    // if (base == infer.ANull) console.error("bad path: " + origPath + " (" + cx.curOrigin + ")");
    cx.paths[origPath] = base == infer.ANull ? null : base;
    return base;
  };

  function emptyObj(ctor) {
    var empty = Object.create(ctor.prototype);
    empty.props = Object.create(null);
    empty.isShell = true;
    return empty;
  }

  function isSimpleAnnotation(spec) {
    if (!spec["!type"] || /^(fn\(|\[)/.test(spec["!type"])) return false;
    for (var prop in spec)
      if (prop != "!type" && prop != "!doc" && prop != "!url" && prop != "!span" && prop != "!data")
        return false;
    return true;
  }

  function pbottomOne(base, spec, path) {
    if (!base) {
      var tp = spec["!type"];
      if (tp) {
        if (/^fn\(/.test(tp)) base = emptyObj(infer.Fn);
        else if (tp.charAt(0) == "[") base = emptyObj(infer.Arr);
        else throw new Error("Invalid !type spec: " + tp);
      } else if (spec["!stdProto"]) {
        base = infer.cx().protos[spec["!stdProto"]];
      } else {
        base = emptyObj(infer.Obj);
      }
      base.name = path;
    }

    for (var name in spec) if (hop(spec, name) && name.charCodeAt(0) != 33) {
      var inner = spec[name];
      if (typeof inner == "string" || isSimpleAnnotation(inner)) continue;
      var prop = base.defProp(name);
      pbottomOne(prop.getObjType(), inner, path ? path + "." + name : name).propagate(prop);
    }
    return base;
  }

  function pbottomTwo(base, spec, path) {
    if (base.isShell) {
      delete base.isShell;
      var tp = spec["!type"];
      if (tp) {
        pbottomType(tp, path, base);
      } else {
        var proto = spec["!proto"] && pbottomType(spec["!proto"]);
        infer.Obj.call(base, proto instanceof infer.Obj ? proto : true, path);
      }
    }

    var effects = spec["!effects"];
    if (effects && base instanceof infer.Fn) for (var i = 0; i < effects.length; ++i)
      parseEffect(effects[i], base);
    copyInfo(spec, base);

    for (var name in spec) if (hop(spec, name) && name.charCodeAt(0) != 33) {
      var inner = spec[name], known = base.defProp(name), innerPath = path ? path + "." + name : name;
      if (typeof inner == "string") {
        if (known.isEmpty()) parseType(inner, innerPath).propagate(known);
      } else {
        if (!isSimpleAnnotation(inner))
          pbottomTwo(known.getObjType(), inner, innerPath);
        else if (known.isEmpty())
          parseType(inner["!type"], innerPath, null, true).propagate(known);
        else
          continue;
        if (inner["!doc"]) known.doc = inner["!doc"];
        if (inner["!url"]) known.url = inner["!url"];
        if (inner["!span"]) known.span = inner["!span"];
      }
    }
    return base;
  }

  function copyInfo(spec, type) {
    if (spec["!doc"]) type.doc = spec["!doc"];
    if (spec["!url"]) type.url = spec["!url"];
    if (spec["!span"]) type.span = spec["!span"];
    if (spec["!data"]) type.metaData = spec["!data"];
  }

  function runPbottomes(type, arg) {
    var parent = infer.cx().parent, pbottom = parent && parent.pbottomes && parent.pbottomes[type];
    if (pbottom) for (var i = 0; i < pbottom.length; i++) pbottom[i](arg);
  }

  function doLoadEnvironment(data, scope) {
    var cx = infer.cx();

    infer.addOrigin(cx.curOrigin = data["!name"] || "env#" + cx.origins.length);
    cx.localDefs = cx.definitions[cx.curOrigin] = Object.create(null);

    runPbottomes("preLoadDef", data);

    pbottomOne(scope, data);

    var def = data["!define"];
    if (def) {
      for (var name in def) {
        var spec = def[name];
        cx.localDefs[name] = typeof spec == "string" ? parsePath(spec) : pbottomOne(null, spec, name);
      }
      for (var name in def) {
        var spec = def[name];
        if (typeof spec != "string") pbottomTwo(cx.localDefs[name], def[name], name);
      }
    }

    pbottomTwo(scope, data);

    runPbottomes("postLoadDef", data);

    cx.curOrigin = cx.localDefs = null;
  }

  exports.load = function(data, scope) {
    if (!scope) scope = infer.cx().topScope;
    var oldScope = currentTopScope;
    currentTopScope = scope;
    try {
      doLoadEnvironment(data, scope);
    } finally {
      currentTopScope = oldScope;
    }
  };

  exports.parse = function(data, origin, path) {
    var cx = infer.cx();
    if (origin) {
      cx.origin = origin;
      cx.localDefs = cx.definitions[origin];
    }

    try {
      if (typeof data == "string")
        return parseType(data, path);
      else
        return pbottomTwo(pbottomOne(null, data, path), data, path);
    } finally {
      if (origin) cx.origin = cx.localDefs = null;
    }
  };

  // Used to register custom logic for more involved effect or type
  // computation.
  var customFunctions = Object.create(null);
  infer.registerFunction = function(name, f) { customFunctions[name] = f; };

  var IsCreated = infer.constraint("created, target, spec", {
    addType: function(tp) {
      if (tp instanceof infer.Obj && this.created++ < 5) {
        var derived = new infer.Obj(tp), spec = this.spec;
        if (spec instanceof infer.AVal) spec = spec.getObjType(false);
        if (spec instanceof infer.Obj) for (var prop in spec.props) {
          var cur = spec.props[prop].types[0];
          var p = derived.defProp(prop);
          if (cur && cur instanceof infer.Obj && cur.props.value) {
            var vtp = cur.props.value.getType(false);
            if (vtp) p.addType(vtp);
          }
        }
        this.target.addType(derived);
      }
    }
  });

  infer.registerFunction("Object_create", function(_self, args, argNodes) {
    if (argNodes && argNodes.length && argNodes[0].type == "Literal" && argNodes[0].value == null)
      return new infer.Obj();

    var result = new infer.AVal;
    if (args[0]) args[0].propagate(new IsCreated(0, result, args[1]));
    return result;
  });

  var PropSpec = infer.constraint("target", {
    addType: function(tp) {
      if (!(tp instanceof infer.Obj)) return;
      if (tp.hasProp("value"))
        tp.getProp("value").propagate(this.target);
      else if (tp.hasProp("get"))
        tp.getProp("get").propagate(new infer.IsCallee(infer.ANull, [], null, this.target));
    }
  });

  infer.registerFunction("Object_defineProperty", function(_self, args, argNodes) {
    if (argNodes && argNodes.length >= 3 && argNodes[1].type == "Literal" &&
        typeof argNodes[1].value == "string") {
      var obj = args[0], connect = new infer.AVal;
      obj.propagate(new infer.PropHasSubset(argNodes[1].value, connect, argNodes[1]));
      args[2].propagate(new PropSpec(connect));
    }
    return infer.ANull;
  });

  infer.registerFunction("Object_defineProperties", function(_self, args, argNodes) {
    if (args.length >= 2) {
      var obj = args[0];
      args[1].forAllProps(function(prop, val, local) {
        if (!local) return;
        var connect = new infer.AVal;
        obj.propagate(new infer.PropHasSubset(prop, connect, argNodes && argNodes[1]));
        val.propagate(new PropSpec(connect));
      });
    }
    return infer.ANull;
  });

  var IsBound = infer.constraint("self, args, target", {
    addType: function(tp) {
      if (!(tp instanceof infer.Fn)) return;
      this.target.addType(new infer.Fn(tp.name, infer.ANull, tp.args.slice(this.args.length),
                                       tp.argNames.slice(this.args.length), tp.retval));
      this.self.propagate(tp.self);
      for (var i = 0; i < Math.min(tp.args.length, this.args.length); ++i)
        this.args[i].propagate(tp.args[i]);
    }
  });

  infer.registerFunction("Function_bind", function(self, args) {
    if (!args.length) return infer.ANull;
    var result = new infer.AVal;
    self.propagate(new IsBound(args[0], args.slice(1), result));
    return result;
  });

  infer.registerFunction("Array_ctor", function(_self, args) {
    var arr = new infer.Arr;
    if (args.length != 1 || !args[0].hasType(infer.cx().num)) {
      var content = arr.getProp("<i>");
      for (var i = 0; i < args.length; ++i) args[i].propagate(content);
    }
    return arr;
  });

  infer.registerFunction("Promise_ctor", function(_self, args, argNodes) {
    if (args.length < 1) return infer.ANull;
    var self = new infer.Obj(infer.cx().definitions.ecma6["Promise.prototype"]);
    var valProp = self.defProp("value", argNodes && argNodes[0]);
    var valArg = new infer.AVal;
    valArg.propagate(valProp);
    var exec = new infer.Fn("execute", infer.ANull, [valArg], ["value"], infer.ANull);
    var reject = infer.cx().definitions.ecma6.promiseReject;
    args[0].propagate(new infer.IsCallee(infer.ANull, [exec, reject], null, infer.ANull));
    return self;
  });

  return exports;
});
