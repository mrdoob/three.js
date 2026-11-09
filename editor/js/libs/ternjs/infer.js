// Main type inference engine

// Walks an AST, building up a graph of abstract values and constraints
// that cause types to flow from one node to another. Also defines a
// number of utilities for accessing ASTs and scopes.

// Analysis is done in a context, which is tracked by the dynamically
// bound cx variable. Use withContext to set the current context.

// For memory-saving reasons, individual types export an interface
// similar to abstract values (which can hold multiple types), and can
// thus be used in place abstract values that only ever contain a
// single type.

(function(root, mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    return mod(exports, require("acorn"), require("acorn-loose"), require("acorn-walk"),
               require("./def"), require("./signal"));
  if (typeof define == "function" && define.amd) // AMD
    return define(["exports", "acorn/dist/acorn", "acorn-loose/dist/acorn-loose", "acorn-walk/dist/walk", "./def", "./signal"], mod);
  mod(root.tern || (root.tern = {}), acorn, acorn.loose, acorn.walk, tern.def, tern.signal); // Plain browser env
})(this, function(exports, acorn, acorn_loose, walk, def, signal) {
  "use strict";

  var toString = exports.toString = function(type, maxDepth, parent) {
    if (!type || type == parent || maxDepth && maxDepth < -3) return "?";
    return type.toString(maxDepth, parent);
  };

  // A variant of AVal used for unknown, dead-end values. Also serves
  // as prototype for AVals, Types, and Constraints because it
  // implements 'empty' versions of all the methods that the code
  // expects.
  var ANull = exports.ANull = signal.mixin({
    addType: function() {},
    propagate: function() {},
    getProp: function() { return ANull; },
    forAllProps: function() {},
    hasType: function() { return false; },
    isEmpty: function() { return true; },
    getFunctionType: function() {},
    getObjType: function() {},
    getSymbolType: function() {},
    getType: function() {},
    gatherProperties: function() {},
    propagatesTo: function() {},
    typeHint: function() {},
    propHint: function() {},
    toString: function() { return "?"; }
  });

  function extend(proto, props) {
    var obj = Object.create(proto);
    if (props) for (var prop in props) obj[prop] = props[prop];
    return obj;
  }

  // ABSTRACT VALUES

  var WG_DEFAULT = 100, WG_NEW_INSTANCE = 90, WG_MADEUP_PROTO = 10,
      WG_MULTI_MEMBER = 6, WG_CATCH_ERROR = 6,
      WG_PHANTOM_OBJ = 1,
      WG_GLOBAL_THIS = 90, WG_SPECULATIVE_THIS = 2, WG_SPECULATIVE_PROTO_THIS = 4;

  var AVal = exports.AVal = function() {
    this.types = [];
    this.forward = null;
    this.maxWeight = 0;
  };
  AVal.prototype = extend(ANull, {
    addType: function(type, weight) {
      weight = weight || WG_DEFAULT;
      if (this.maxWeight < weight) {
        this.maxWeight = weight;
        if (this.types.length == 1 && this.types[0] == type) return;
        this.types.length = 0;
      } else if (this.maxWeight > weight || this.types.indexOf(type) > -1) {
        return;
      }

      this.signal("addType", type);
      this.types.push(type);
      var forward = this.forward;
      if (forward) withWorklist(function(add) {
        for (var i = 0; i < forward.length; ++i) add(type, forward[i], weight);
      });
    },

    propagate: function(target, weight) {
      if (target == ANull || (target instanceof Type && this.forward && this.forward.length > 2)) return;
      if (weight && weight != WG_DEFAULT) target = new Muffle(target, weight);
      (this.forward || (this.forward = [])).push(target);
      var types = this.types;
      if (types.length) withWorklist(function(add) {
        for (var i = 0; i < types.length; ++i) add(types[i], target, weight);
      });
    },

    getProp: function(prop) {
      if (ignoredProp(prop)) return ANull;
      var found = (this.props || (this.props = Object.create(null)))[prop];
      if (!found) {
        found = this.props[prop] = new AVal;
        this.propagate(new GetProp(prop, found));
      }
      return found;
    },

    forAllProps: function(c) {
      this.propagate(new ForAllProps(c));
    },

    hasType: function(type) {
      return this.types.indexOf(type) > -1;
    },
    isEmpty: function() { return this.types.length === 0; },
    getFunctionType: function() {
      for (var i = this.types.length - 1; i >= 0; --i)
        if (this.types[i] instanceof Fn) return this.types[i];
    },
    getObjType: function() {
      var seen = null;
      for (var i = this.types.length - 1; i >= 0; --i) {
        var type = this.types[i];
        if (!(type instanceof Obj)) continue;
        if (type.name) return type;
        if (!seen) seen = type;
      }
      return seen;
    },

    getSymbolType: function() {
      for (var i = this.types.length - 1; i >= 0; --i)
        if (this.types[i] instanceof Sym) return this.types[i];
    },

    getType: function(guess) {
      if (this.types.length === 0 && guess !== false) return this.makeupType();
      if (this.types.length === 1) return this.types[0];
      return canonicalType(this.types);
    },

    toString: function(maxDepth, parent) {
      if (this.types.length == 0) return toString(this.makeupType(), maxDepth, parent);
      if (this.types.length == 1) return toString(this.types[0], maxDepth, parent);
      var simplified = simplifyTypes(this.types);
      if (simplified.length > 2) return "?";
      return simplified.map(function(tp) { return toString(tp, maxDepth, parent); }).join("|");
    },

    makeupPropType: function(obj) {
      var propName = this.propertyName;

      var protoProp = obj.proto && obj.proto.hasProp(propName);
      if (protoProp) {
        var fromProto = protoProp.getType();
        if (fromProto) return fromProto;
      }

      if (propName != "<i>") {
        var computedProp = obj.hasProp("<i>");
        if (computedProp) return computedProp.getType();
      } else if (obj.props["<i>"] != this) {
        for (var prop in obj.props) {
          var val = obj.props[prop];
          if (!val.isEmpty()) return val.getType();
        }
      }
    },

    makeupType: function() {
      var computed = this.propertyOf && this.makeupPropType(this.propertyOf);
      if (computed) return computed;

      if (!this.forward) return null;
      for (var i = this.forward.length - 1; i >= 0; --i) {
        var hint = this.forward[i].typeHint();
        if (hint && !hint.isEmpty()) {guessing = true; return hint;}
      }

      var props = Object.create(null), foundProp = null;
      for (var i = 0; i < this.forward.length; ++i) {
        var prop = this.forward[i].propHint();
        if (prop && prop != "length" && prop != "<i>" && prop != "✖" && prop != cx.completingProperty) {
          props[prop] = true;
          foundProp = prop;
        }
      }
      if (!foundProp) return null;

      var objs = objsWithProp(foundProp);
      if (objs) {
        var matches = [];
        search: for (var i = 0; i < objs.length; ++i) {
          var obj = objs[i];
          for (var prop in props) if (!obj.hasProp(prop)) continue search;
          if (obj.hasCtor) obj = getInstance(obj);
          matches.push(obj);
        }
        var canon = canonicalType(matches);
        if (canon) {guessing = true; return canon;}
      }
    },

    typeHint: function() { return this.types.length ? this.getType() : null; },
    propagatesTo: function() { return this; },

    gatherProperties: function(f, depth) {
      for (var i = 0; i < this.types.length; ++i)
        this.types[i].gatherProperties(f, depth);
    },

    guessProperties: function(f) {
      if (this.forward) for (var i = 0; i < this.forward.length; ++i) {
        var prop = this.forward[i].propHint();
        if (prop) f(prop, null, 0);
      }
      var guessed = this.makeupType();
      if (guessed) guessed.gatherProperties(f);
    }
  });

  function similarAVal(a, b, depth) {
    var typeA = a.getType(false), typeB = b.getType(false);
    if (!typeA || !typeB) return true;
    return similarType(typeA, typeB, depth);
  }

  function similarType(a, b, depth) {
    if (!a || depth >= 5) return b;
    if (!a || a == b) return a;
    if (!b) return a;
    if (a.constructor != b.constructor) return false;
    if (a.constructor == Arr) {
      var innerA = a.getProp("<i>").getType(false);
      if (!innerA) return b;
      var innerB = b.getProp("<i>").getType(false);
      if (!innerB || similarType(innerA, innerB, depth + 1)) return b;
    } else if (a.constructor == Obj) {
      var propsA = 0, propsB = 0, same = 0;
      for (var prop in a.props) {
        propsA++;
        if (prop in b.props && similarAVal(a.props[prop], b.props[prop], depth + 1))
          same++;
      }
      for (var prop in b.props) propsB++;
      if (propsA && propsB && same < Math.max(propsA, propsB) / 2) return false;
      return propsA > propsB ? a : b;
    } else if (a.constructor == Fn) {
      if (a.args.length != b.args.length ||
          !a.args.every(function(tp, i) { return similarAVal(tp, b.args[i], depth + 1); }) ||
          !similarAVal(a.retval, b.retval, depth + 1) || !similarAVal(a.self, b.self, depth + 1))
        return false;
      return a;
    } else {
      return false;
    }
  }

  var simplifyTypes = exports.simplifyTypes = function(types) {
    var found = [];
    outer: for (var i = 0; i < types.length; ++i) {
      var tp = types[i];
      for (var j = 0; j < found.length; j++) {
        var similar = similarType(tp, found[j], 0);
        if (similar) {
          found[j] = similar;
          continue outer;
        }
      }
      found.push(tp);
    }
    return found;
  };

  function canonicalType(types) {
    var arrays = 0, fns = 0, objs = 0, prim = null;
    for (var i = 0; i < types.length; ++i) {
      var tp = types[i];
      if (tp instanceof Arr) ++arrays;
      else if (tp instanceof Fn) ++fns;
      else if (tp instanceof Obj) ++objs;
      else if (tp instanceof Prim) {
        if (prim && tp.name != prim.name) return null;
        prim = tp;
      }
    }
    var kinds = (arrays && 1) + (fns && 1) + (objs && 1) + (prim && 1);
    if (kinds > 1) return null;
    if (prim) return prim;

    var maxScore = 0, maxTp = null;
    for (var i = 0; i < types.length; ++i) {
      var tp = types[i], score = 0;
      if (arrays) {
        score = tp.getProp("<i>").isEmpty() ? 1 : 2;
      } else if (fns) {
        score = 1;
        for (var j = 0; j < tp.args.length; ++j) if (!tp.args[j].isEmpty()) ++score;
        if (!tp.retval.isEmpty()) ++score;
      } else if (objs) {
        score = tp.name ? 100 : 2;
      }
      if (score >= maxScore) { maxScore = score; maxTp = tp; }
    }
    return maxTp;
  }

  // PROPAGATION STRATEGIES

  var constraint = exports.constraint = function(methods) {
    var ctor = function() {
      this.origin = cx.curOrigin;
      this.construct.apply(this, arguments);
    };
    ctor.prototype = Object.create(ANull);
    for (var m in methods) if (methods.hasOwnProperty(m)) ctor.prototype[m] = methods[m];
    return ctor;
  };

  var GetProp = constraint({
    construct: function(prop, target) {
      this.prop = prop; this.target = target;
    },
    addType: function(type, weight) {
      if (type.getProp)
        type.getProp(this.prop).propagate(this.target, weight);
    },
    propHint: function() { return this.prop; },
    propagatesTo: function() {
      if (this.prop == "<i>" || !/[^\w_]/.test(this.prop))
        return {target: this.target, pathExt: "." + this.prop};
    }
  });

  var DefProp = exports.PropHasSubset = exports.DefProp = constraint({
    construct: function(prop, type, originNode) {
      this.prop = prop; this.type = type; this.originNode = originNode;
    },
    addType: function(type, weight) {
      if (!(type instanceof Obj)) return;
      var prop = type.defProp(this.prop, this.originNode);
      if (!prop.origin) prop.origin = this.origin;
      this.type.propagate(prop, weight);
    },
    propHint: function() { return this.prop; }
  });

  var ForAllProps = constraint({
    construct: function(c) { this.c = c; },
    addType: function(type) {
      if (!(type instanceof Obj)) return;
      type.forAllProps(this.c);
    }
  });

  function withDisabledComputing(fn, body) {
    cx.disabledComputing = {fn: fn, prev: cx.disabledComputing};
    var result = body();
    cx.disabledComputing = cx.disabledComputing.prev;
    return result;
  }
  var IsCallee = exports.IsCallee = constraint({
    construct: function(self, args, argNodes, retval) {
      this.self = self; this.args = args; this.argNodes = argNodes; this.retval = retval;
      this.disabled = cx.disabledComputing;
    },
    addType: function(fn, weight) {
      if (!(fn instanceof Fn)) return;
      for (var i = 0; i < this.args.length; ++i) {
        if (i < fn.args.length) this.args[i].propagate(fn.args[i], weight);
        if (fn.arguments) this.args[i].propagate(fn.arguments, weight);
      }
      if (!fn.isArrowFn())
        this.self.propagate(fn.self, this.self == cx.topScope ? WG_GLOBAL_THIS : weight);
      var compute = fn.computeRet, result = fn.retval;
      if (compute) for (var d = this.disabled; d; d = d.prev)
        if (d.fn == fn || fn.originNode && d.fn.originNode == fn.originNode) compute = null;
      if (compute) {
        var old = cx.disabledComputing;
        cx.disabledComputing = this.disabled;
        result = compute(this.self, this.args, this.argNodes);
        cx.disabledComputing = old;
      }
      if (fn.async && !fn.generator) {
        var tp = result.getType();
        if (!(tp && tp.constructor == Obj && tp.name == "Promise")) {
          var defs = cx.definitions.ecmascript;
          var rtnval = defs && new Obj(defs["Promise.prototype"]);
          if (rtnval) {
            rtnval.getType().propagate(new DefProp(':t', result));
            result = rtnval;            
          }
        }
      }
      maybeIterator(fn, result).propagate(this.retval, weight);
    },
    typeHint: function() {
      var names = [];
      for (var i = 0; i < this.args.length; ++i) names.push("?");
      return new Fn(null, this.self, this.args, names, ANull);
    },
    propagatesTo: function() {
      return {target: this.retval, pathExt: ".!ret"};
    }
  });

  var HasMethodCall = constraint({
    construct: function(propName, args, argNodes, retval) {
      this.propName = propName; this.args = args; this.argNodes = argNodes; this.retval = retval;
      this.disabled = cx.disabledComputing;
    },
    addType: function(obj, weight) {
      var callee = new IsCallee(obj, this.args, this.argNodes, this.retval);
      callee.disabled = this.disabled;
      obj.getProp(this.propName).propagate(callee, weight);
    },
    propHint: function() { return this.propName; }
  });

  var IsCtor = exports.IsCtor = constraint({
    construct: function(target, noReuse) {
      this.target = target; this.noReuse = noReuse;
    },
    addType: function(f, weight) {
      if (!(f instanceof Fn)) return;
      if (cx.parent && !cx.parent.options.reuseInstances) this.noReuse = true;
      f.getProp("prototype").propagate(new IsProto(this.noReuse ? false : f, this.target), weight);
    }
  });

  var getInstance = exports.getInstance = function(obj, ctor) {
    if (ctor === false) return new Obj(obj);

    if (!ctor) ctor = obj.hasCtor;
    if (!obj.instances) obj.instances = [];
    for (var i = 0; i < obj.instances.length; ++i) {
      var cur = obj.instances[i];
      if (cur.ctor == ctor) return cur.instance;
    }
    var instance = new Obj(obj, ctor && ctor.name);
    instance.origin = obj.origin;
    obj.instances.push({ctor: ctor, instance: instance});
    return instance;
  };

  var IsProto = exports.IsProto = constraint({
    construct: function(ctor, target) {
      this.ctor = ctor; this.target = target;
    },
    addType: function(o, _weight) {
      if (!(o instanceof Obj)) return;
      if ((this.count = (this.count || 0) + 1) > 8) return;
      if (o == cx.protos.Array)
        this.target.addType(new Arr);
      else
        this.target.addType(getInstance(o, this.ctor));
    }
  });

  var FnPrototype = constraint({
    construct: function(fn) { this.fn = fn; },
    addType: function(o, _weight) {
      if (o instanceof Obj && !o.hasCtor) {
        o.hasCtor = this.fn;
        var adder = new SpeculativeThis(o, this.fn);
        adder.addType(this.fn);
        o.forAllProps(function(_prop, val, local) {
          if (local) val.propagate(adder);
        });
      }
    }
  });

  var IsAdded = constraint({
    construct: function(other, target) {
      this.other = other; this.target = target;
    },
    addType: function(type, weight) {
      if (type == cx.str)
        this.target.addType(cx.str, weight);
      else if (type == cx.num && this.other.hasType(cx.num))
        this.target.addType(cx.num, weight);
    },
    typeHint: function() { return this.other; }
  });

  var IfObj = exports.IfObj = constraint({
    construct: function(target) { this.target = target; },
    addType: function(t, weight) {
      if (t instanceof Obj) this.target.addType(t, weight);
    },
    propagatesTo: function() { return this.target; }
  });

  var SpeculativeThis = constraint({
    construct: function(obj, ctor) { this.obj = obj; this.ctor = ctor; },
    addType: function(tp) {
      if (tp instanceof Fn && tp.self)
        tp.self.addType(getInstance(this.obj, this.ctor), WG_SPECULATIVE_PROTO_THIS);
    }
  });

  var HasProto = constraint({
    construct: function(obj) { this.obj = obj },
    addType: function(tp) {
      if (tp instanceof Obj && this.obj.proto == cx.protos.Object)
        this.obj.replaceProto(tp);
    }
  });

  var Muffle = constraint({
    construct: function(inner, weight) {
      this.inner = inner; this.weight = weight;
    },
    addType: function(tp, weight) {
      this.inner.addType(tp, Math.min(weight, this.weight));
    },
    propagatesTo: function() { return this.inner.propagatesTo(); },
    typeHint: function() { return this.inner.typeHint(); },
    propHint: function() { return this.inner.propHint(); }
  });

  // TYPE OBJECTS

  var Type = exports.Type = function() {};
  Type.prototype = extend(ANull, {
    constructor: Type,
    propagate: function(c, w) { c.addType(this, w); },
    hasType: function(other) { return other == this; },
    isEmpty: function() { return false; },
    typeHint: function() { return this; },
    getType: function() { return this; }
  });

  var Prim = exports.Prim = function(proto, name) { this.name = name; this.proto = proto; };
  Prim.prototype = extend(Type.prototype, {
    constructor: Prim,
    toString: function() { return this.name; },
    getProp: function(prop) {return this.proto.hasProp(prop) || ANull;},
    gatherProperties: function(f, depth) {
      if (this.proto) this.proto.gatherProperties(f, depth);
    }
  });

  function isInteger(str) {
    var c0 = str.charCodeAt(0);
    if (c0 >= 48 && c0 <= 57) return !/\D/.test(str);
    else return false;
  }

  var Obj = exports.Obj = function(proto, name) {
    if (!this.props) this.props = Object.create(null);
    this.proto = proto === true ? cx.protos.Object : proto;
    if (proto && proto != cx.protos.Object && !name && proto.name && !(this instanceof Fn)) {
      var match = /^(.*)\.prototype$/.exec(this.proto.name);
      if (match) name = match[1];
    }
    this.name = name;
    this.maybeProps = null;
    this.origin = cx.curOrigin;
  };
  Obj.prototype = extend(Type.prototype, {
    constructor: Obj,
    toString: function(maxDepth) {
      if (maxDepth == null) maxDepth = 0;
      if (maxDepth <= 0 && this.name) return this.name;
      var props = [], etc = false;
      for (var prop in this.props) if (prop != "<i>") {
        if (props.length > 5) { etc = true; break; }
        if (maxDepth)
          props.push(prop + ": " + toString(this.props[prop], maxDepth - 1, this));
        else
          props.push(prop);
      }
      props.sort();
      if (etc) props.push("...");
      return "{" + props.join(", ") + "}";
    },
    hasProp: function(prop, searchProto) {
      if (isInteger(prop)) prop = this.normalizeIntegerProp(prop);
      var found = this.props[prop];
      if (searchProto !== false)
        for (var p = this.proto; p && !found; p = p.proto) found = p.props[prop];
      return found;
    },
    defProp: function(prop, originNode) {
      var found = this.hasProp(prop, false);
      if (found) {
        if (originNode && !found.originNode) found.originNode = originNode;
        return found;
      }
      if (ignoredProp(prop)) return ANull;
      if (isInteger(prop)) prop = this.normalizeIntegerProp(prop);

      var av = this.maybeProps && this.maybeProps[prop];
      if (av) {
        delete this.maybeProps[prop];
        this.maybeUnregProtoPropHandler();
      } else {
        av = new AVal;
        av.propertyOf = this;
        av.propertyName = prop;
      }

      this.props[prop] = av;
      av.originNode = originNode;
      av.origin = cx.curOrigin;
      this.broadcastProp(prop, av, true);
      return av;
    },
    getProp: function(prop) {
      var found = this.hasProp(prop, true) || (this.maybeProps && this.maybeProps[prop]);
      if (found) return found;
      if (ignoredProp(prop)) return ANull;
      if (isInteger(prop)) prop = this.normalizeIntegerProp(prop);
      var av = this.ensureMaybeProps()[prop] = new AVal;
      av.propertyOf = this;
      av.propertyName = prop;
      return av;
    },
    normalizeIntegerProp: function(_) { return "<i>" },
    broadcastProp: function(prop, val, local) {
      if (local) {
        this.signal("addProp", prop, val);
        // If this is a scope, it shouldn't be registered
        if (!(this instanceof Scope)) registerProp(prop, this);
      }

      if (this.onNewProp) for (var i = 0; i < this.onNewProp.length; ++i) {
        var h = this.onNewProp[i];
        h.onProtoProp ? h.onProtoProp(prop, val, local) : h(prop, val, local);
      }
    },
    onProtoProp: function(prop, val, _local) {
      var maybe = this.maybeProps && this.maybeProps[prop];
      if (maybe) {
        delete this.maybeProps[prop];
        this.maybeUnregProtoPropHandler();
        this.proto.getProp(prop).propagate(maybe);
      }
      this.broadcastProp(prop, val, false);
    },
    replaceProto: function(proto) {
      for (var o = proto; o; o = o.proto)
        if (o == this) return;
      if (this.proto && this.maybeProps)
        this.proto.unregPropHandler(this);
      this.proto = proto;
      if (this.maybeProps)
        this.proto.forAllProps(this);
    },
    ensureMaybeProps: function() {
      if (!this.maybeProps) {
        if (this.proto) this.proto.forAllProps(this);
        this.maybeProps = Object.create(null);
      }
      return this.maybeProps;
    },
    removeProp: function(prop) {
      var av = this.props[prop];
      delete this.props[prop];
      this.ensureMaybeProps()[prop] = av;
      av.types.length = 0;
    },
    forAllProps: function(c) {
      if (!this.onNewProp) {
        this.onNewProp = [];
        if (this.proto) this.proto.forAllProps(this);
      }
      this.onNewProp.push(c);
      for (var o = this; o; o = o.proto) for (var prop in o.props) {
        if (c.onProtoProp)
          c.onProtoProp(prop, o.props[prop], o == this);
        else
          c(prop, o.props[prop], o == this);
      }
    },
    maybeUnregProtoPropHandler: function() {
      if (this.maybeProps) {
        for (var _n in this.maybeProps) return;
        this.maybeProps = null;
      }
      if (!this.proto || this.onNewProp && this.onNewProp.length) return;
      this.proto.unregPropHandler(this);
    },
    unregPropHandler: function(handler) {
      for (var i = 0; i < this.onNewProp.length; ++i)
        if (this.onNewProp[i] == handler) { this.onNewProp.splice(i, 1); break; }
      this.maybeUnregProtoPropHandler();
    },
    gatherProperties: function(f, depth) {
      for (var prop in this.props) if (prop != "<i>" && prop.charAt(0) != ":")
        f(prop, this, depth);
      if (this.proto) this.proto.gatherProperties(f, depth + 1);
    },
    getObjType: function() { return this; }
  });

  var geckoIterators = typeof StopIteration != "undefined";
  function ignoredProp(name) {
    return name == "__proto__" || name == "✖" || geckoIterators && name == "__iterator__";
  }

  var Fn = exports.Fn = function(name, self, args, argNames, retval, generator, async) {
    Obj.call(this, cx.protos.Function, name);
    this.self = self;
    this.args = args;
    this.argNames = argNames;
    this.retval = retval;
    this.generator = generator;
    this.async = async;
  };
  Fn.prototype = extend(Obj.prototype, {
    constructor: Fn,
    toString: function(maxDepth) {
      if (maxDepth == null) maxDepth = 0;
      var str = this.generator ? "fn*(" : "fn(";
      for (var i = 0; i < this.args.length; ++i) {
        if (i) str += ", ";
        var name = this.argNames[i];
        if (name && name != "?") str += name + ": ";
        str += maxDepth > -3 ? toString(this.args[i], maxDepth - 1, this) : "?";
      }
      str += ")";
      if (!this.retval.isEmpty())
        str += " -> " + (maxDepth > -3 ? toString(this.retval, maxDepth - 1, this) : "?");
      return str;
    },
    getProp: function(prop) {
      if (prop == "prototype") {
        var known = this.hasProp(prop, false);
        if (!known) {
          known = this.defProp(prop);
          var proto = new Obj(true, this.name && this.name + ".prototype");
          proto.origin = this.origin;
          known.addType(proto, WG_MADEUP_PROTO);
        }
        return known;
      }
      return Obj.prototype.getProp.call(this, prop);
    },
    defProp: function(prop, originNode) {
      if (prop == "prototype") {
        var found = this.hasProp(prop, false);
        if (found) return found;
        found = Obj.prototype.defProp.call(this, prop, originNode);
        found.origin = this.origin;
        found.propagate(new FnPrototype(this));
        return found;
      }
      return Obj.prototype.defProp.call(this, prop, originNode);
    },
    getFunctionType: function() { return this; },
    isArrowFn: function() { return this.originNode && this.originNode.type == "ArrowFunctionExpression" }
  });

  var Arr = exports.Arr = function(contentType) {
    Obj.call(this, cx.protos.Array);
    var content = this.defProp("<i>");
    if (Array.isArray(contentType)) {
      this.tuple = contentType.length;
      for (var i = 0; i < contentType.length; i++) {
        var prop = this.defProp(String(i));
        contentType[i].propagate(prop);
        prop.propagate(content);
      }
    } else if (contentType) {
      this.tuple = 0;
      contentType.propagate(content);
    }
  };
  Arr.prototype = extend(Obj.prototype, {
    constructor: Arr,
    toString: function(maxDepth) {
      if (maxDepth == null) maxDepth = 0;
      if (maxDepth <= -3) return "[?]";
      var content = "";
      if (this.tuple) {
        var similar;
        for (var i = 0; i in this.props; i++) {
          var type = toString(this.getProp(String(i)), maxDepth - 1, this);
          if (similar == null)
            similar = type;
          else if (similar != type)
            similar = false;
          else
            similar = type;
          content += (content ? ", " : "") + type;
        }
        if (similar) content = similar;
      } else {
        content = toString(this.getProp("<i>"), maxDepth - 1, this);
      }
      return "[" + content + "]";
    },
    normalizeIntegerProp: function(prop) {
      if (+prop < this.tuple) return prop;
      else return "<i>";
    }
  });

  var Sym = exports.Sym = function(name, originNode) {
    Prim.call(this, cx.protos.Symbol, "Symbol");
    this.symName = name;
    this.originNode = originNode;
  };
  Sym.prototype = extend(Prim.prototype, {
    constructor: Sym,
    asPropName: function() { return ":" + this.symName },
    getSymbolType: function() { return this }
  });

  exports.getSymbol = function(name, originNode) {
    var cleanName = name.replace(/[^\w$\.]/g, "_");
    var known = cx.symbols[cleanName];
    if (known) {
      if (originNode && !known.originNode) known.originNode = originNode;
      return known;
    }
    return cx.symbols[cleanName] = new Sym(cleanName, originNode);
  };

  // THE PROPERTY REGISTRY

  function registerProp(prop, obj) {
    var data = cx.props[prop] || (cx.props[prop] = []);
    data.push(obj);
  }

  function objsWithProp(prop) {
    return cx.props[prop];
  }

  // INFERENCE CONTEXT

  exports.Context = function(defs, parent) {
    this.parent = parent;
    this.props = Object.create(null);
    this.protos = Object.create(null);
    this.origins = [];
    this.curOrigin = "ecmascript";
    this.paths = Object.create(null);
    this.definitions = Object.create(null);
    this.purgeGen = 0;
    this.workList = null;
    this.disabledComputing = null;
    this.curSuperCtor = this.curSuper = null;
    this.symbols = Object.create(null);

    exports.withContext(this, function() {
      cx.protos.Object = new Obj(null, "Object.prototype");
      cx.topScope = new Scope();
      cx.topScope.name = "<top>";
      cx.protos.Array = new Obj(true, "Array.prototype");
      cx.protos.Function = new Fn("Function.prototype", ANull, [], [], ANull);
      cx.protos.Function.proto = cx.protos.Object;
      cx.protos.RegExp = new Obj(true, "RegExp.prototype");
      cx.protos.String = new Obj(true, "String.prototype");
      cx.protos.Number = new Obj(true, "Number.prototype");
      cx.protos.Boolean = new Obj(true, "Boolean.prototype");
      cx.protos.Symbol = new Obj(true, "Symbol.prototype");
      cx.str = new Prim(cx.protos.String, "string");
      cx.bool = new Prim(cx.protos.Boolean, "bool");
      cx.num = new Prim(cx.protos.Number, "number");
      cx.curOrigin = null;

      if (defs) for (var i = 0; i < defs.length; ++i)
        def.load(defs[i]);
    });
  };

  exports.Context.prototype.startAnalysis = function() {
    this.disabledComputing = this.workList = this.curSuperCtor = this.curSuper = null;
  };

  var cx = null;
  exports.cx = function() { return cx; };

  exports.withContext = function(context, f) {
    var old = cx;
    cx = context;
    try { return f(); }
    finally { cx = old; }
  };

  exports.TimedOut = function() {
    this.message = "Timed out";
    this.stack = (new Error()).stack;
  };
  exports.TimedOut.prototype = Object.create(Error.prototype);
  exports.TimedOut.prototype.name = "infer.TimedOut";

  var timeout;
  exports.withTimeout = function(ms, f) {
    var end = +new Date + ms;
    var oldEnd = timeout;
    if (oldEnd && oldEnd < end) return f();
    timeout = end;
    try { return f(); }
    finally { timeout = oldEnd; }
  };

  exports.addOrigin = function(origin) {
    if (cx.origins.indexOf(origin) < 0) cx.origins.push(origin);
  };

  var baseMaxWorkDepth = 20, reduceMaxWorkDepth = 0.0001;
  function withWorklist(f) {
    if (cx.workList) return f(cx.workList);

    var list = [], depth = 0;
    var add = cx.workList = function(type, target, weight) {
      if (depth < baseMaxWorkDepth - reduceMaxWorkDepth * list.length)
        list.push(type, target, weight, depth);
    };
    var ret = f(add);
    for (var i = 0; i < list.length; i += 4) {
      if (timeout && +new Date >= timeout)
        throw new exports.TimedOut();
      depth = list[i + 3] + 1;
      list[i + 1].addType(list[i], list[i + 2]);
    }
    cx.workList = null;
    return ret;
  }

  function withSuper(ctor, obj, f) {
    var oldCtor = cx.curSuperCtor, oldObj = cx.curSuper;
    cx.curSuperCtor = ctor; cx.curSuper = obj;
    var result = f();
    cx.curSuperCtor = oldCtor; cx.curSuper = oldObj;
    return result;
  }

  // SCOPES

  var Scope = exports.Scope = function(prev, originNode, isBlock, isCatch) {
    Obj.call(this, prev || true);
    this.prev = prev;
    this.originNode = originNode;
    this.isBlock = !!isBlock;
    this.isCatch = !!isCatch;
  };
  Scope.prototype = extend(Obj.prototype, {
    constructor: Scope,
    defVar: function(name, originNode) {
      for (var s = this; ; s = s.proto) {
        var found = s.props[name];
        if (found) return found;
        if (!s.prev) return s.defProp(name, originNode);
      }
    }
  });

  function functionScope(scope, arrow) {
    while (scope.isBlock || scope.isCatch || (arrow === false && scope.fnType && scope.fnType.isArrowFn()))
      scope = scope.prev;
    return scope;
  }


  // RETVAL COMPUTATION HEURISTICS

  function maybeInstantiate(scope, score) {
    var fn = functionScope(scope).fnType;
    if (fn) fn.instantiateScore = (fn.instantiateScore || 0) + score;
  }

  var NotSmaller = {};
  function nodeSmallerThan(node, n) {
    try {
      walk.simple(node, {Expression: function() { if (--n <= 0) throw NotSmaller; }});
      return true;
    } catch(e) {
      if (e == NotSmaller) return false;
      throw e;
    }
  }

  function maybeTagAsInstantiated(node, fn) {
    var score = fn.instantiateScore;
    if (!cx.disabledComputing && score && fn.args.length && nodeSmallerThan(node, score * 5)) {
      maybeInstantiate(functionScope(fn.originNode.scope.prev), score / 2);
      setFunctionInstantiated(node, fn);
      return true;
    } else {
      fn.instantiateScore = null;
    }
  }

  function setFunctionInstantiated(node, fn) {
    // Disconnect the arg avals, so that we can add info to them without side effects
    var refScope = node.scope;
    for (var i = 0; i < fn.args.length; ++i) fn.args[i] = new AVal;
    fn.self = new AVal;
    fn.computeRet = function(self, args) {
      // Prevent recursion
      return withDisabledComputing(fn, function() {
        var oldOrigin = cx.curOrigin;
        cx.curOrigin = fn.origin;
        var scope = node.scope ? node.scope : refScope;
        var scopeCopy = new Scope(scope.prev, scope.originNode);
        for (var v in scope.props) {
          var local = scopeCopy.defProp(v, scope.props[v].originNode);
          for (var i = 0; i < args.length; ++i) if (fn.argNames[i] == v && i < args.length)
            args[i].propagate(local);
        }
        var argNames = fn.argNames.length != args.length ? fn.argNames.slice(0, args.length) : fn.argNames;
        while (argNames.length < args.length) argNames.push("?");
        scopeCopy.fnType = new Fn(fn.name, self, args, argNames, ANull, fn.generator, fn.async);
        scopeCopy.fnType.originNode = fn.originNode;
        if (fn.arguments) {
          var argset = scopeCopy.fnType.arguments = new AVal;
          scopeCopy.defProp("arguments").addType(new Arr(argset));
          for (var i = 0; i < args.length; ++i) args[i].propagate(argset);
        }
        node.scope = scopeCopy;
        walk.recursive(node.body, scopeCopy, null, scopeGatherer);
        walk.recursive(node.body, scopeCopy, null, inferWrapper);
        cx.curOrigin = oldOrigin;
        return scopeCopy.fnType.retval;
      });
    };
  }

  function maybeTagAsGeneric(fn) {
    var target = fn.retval;
    if (target == ANull || fn.isArrowFn()) return;
    var targetInner, asArray;
    if (!target.isEmpty() && (targetInner = target.getType()) instanceof Arr)
      target = asArray = targetInner.getProp("<i>");

    function explore(aval, path, depth) {
      if (depth > 3 || !aval.forward) return;
      for (var i = 0; i < aval.forward.length; ++i) {
        var prop = aval.forward[i].propagatesTo();
        if (!prop) continue;
        var newPath = path, dest;
        if (prop instanceof AVal) {
          dest = prop;
        } else if (prop.target instanceof AVal) {
          newPath += prop.pathExt;
          dest = prop.target;
        } else continue;
        if (dest == target) return newPath;
        var found = explore(dest, newPath, depth + 1);
        if (found) return found;
      }
    }

    var foundPath = explore(fn.self, "!this", 0);
    for (var i = 0; !foundPath && i < fn.args.length; ++i)
      foundPath = explore(fn.args[i], "!" + i, 0);

    if (foundPath) {
      if (asArray) foundPath = "[" + foundPath + "]";
      var p = new def.TypeParser(foundPath);
      var parsed = p.parseType(true);
      fn.computeRet = parsed.apply ? parsed : function() { return parsed; };
      fn.computeRetSource = foundPath;
      return true;
    }
  }

  // SCOPE GATHERING PASS

  function addVar(scope, nameNode) {
    return scope.defProp(nameNode.name, nameNode);
  }
  function patternName(node) {
    if (node.type == "Identifier") return node.name;
    if (node.type == "AssignmentPattern") return patternName(node.left);
    if (node.type == "ObjectPattern") return "{" + node.properties.map(function(e) { return patternName(e.type === 'RestElement' ? e : e.value) }).join(", ") + "}";
    if (node.type == "ArrayPattern") return "[" + node.elements.map(function(e) { return e ? patternName(e) : "" }).join(", ") + "]";
    if (node.type == "RestElement") return "..." + patternName(node.argument);
    return "_";
  }

  function isBlockScopedDecl(node) {
    return node.type == "VariableDeclaration" && node.kind != "var" ||
      node.type == "FunctionDeclaration" ||
      node.type == "ClassDeclaration";
  }

  function patternScopes(inner, outer) {
    return {inner: inner, outer: outer || inner};
  }

  var scopeGatherer = exports.scopeGatherer = walk.make({
    VariablePattern: function(node, scopes) {
      if (scopes.inner) addVar(scopes.inner, node);
    },
    AssignmentPattern: function(node, scopes, c) {
      c(node.left, scopes, "Pattern");
      c(node.right, scopes.outer, "Expression");
    },
    AssignmentExpression: function(node, scope, c) {
      if (node.left.type == "MemberExpression")
        c(node.left, scope, "Expression");
      else
        c(node.left, patternScopes(false, scope), "Pattern");
      c(node.right, scope, "Expression");
    },
    MemberPattern: function(node, scope, c) {
      c(node, scope.outer);
    },
    Function: function(node, scope, c) {
      var inner = node.scope = new Scope(scope, node);
      var argVals = [], argNames = [];
      for (var i = 0; i < node.params.length; ++i) {
        var param = node.params[i];
        argNames.push(patternName(param));
        if (param.type == "Identifier") {
          argVals.push(addVar(inner, param));
        } else {
          var arg = new AVal;
          argVals.push(arg);
          arg.originNode = param;
          c(param, patternScopes(inner), "Pattern");
        }
      }
      inner.fnType = new Fn(node.id && node.id.name, new AVal, argVals, argNames, ANull, node.generator, node.async);
      inner.fnType.originNode = node;
      if (node.id) {
        var decl = node.type == "FunctionDeclaration";
        addVar(decl ? scope : inner, node.id);
      }
      c(node.body, inner, node.expression ? "Expression" : "Statement");
    },
    BlockStatement: function(node, scope, c) {
      if (!node.scope && node.body.some(isBlockScopedDecl))
        scope = node.scope = new Scope(scope, node, true);
      walk.base.BlockStatement(node, scope, c);
    },
    CatchClause: function(node, scope, c) {
      if (!node.param) { return; }
      scope = node.scope = new Scope(scope, node, false, true);
      if (node.param.type == "Identifier") {
        var v = addVar(scope, node.param);
        c(node.body, scope, "Statement");
        var ecma = cx.definitions.ecmascript;
        if (ecma && v.isEmpty()) getInstance(ecma["Error.prototype"]).propagate(v, WG_CATCH_ERROR);
      } else {
        c(node.param, patternScopes(scope), "Pattern");
      }
    },
    VariableDeclaration: function(node, scope, c) {
      var targetScope = node.kind == "var" ? functionScope(scope) : scope;
      for (var i = 0; i < node.declarations.length; ++i) {
        var decl = node.declarations[i];
        c(decl.id, patternScopes(targetScope, scope), "Pattern");
        if (decl.init) c(decl.init, scope, "Expression");
      }
    },
    ClassDeclaration: function(node, scope, c) {
      if (node.id) addVar(scope, node.id);
      if (node.superClass) c(node.superClass, scope, "Expression");
      for (var i = 0; i < node.body.body.length; i++)
        c(node.body.body[i], scope);
    },
    ForInStatement: function(node, scope, c) {
      if (!node.scope && isBlockScopedDecl(node.left))
        scope = node.scope = new Scope(scope, node, true);
      walk.base.ForInStatement(node, scope, c);
    },
    ForStatement: function(node, scope, c) {
      if (!node.scope && node.init && isBlockScopedDecl(node.init))
        scope = node.scope = new Scope(scope, node, true);
      walk.base.ForStatement(node, scope, c);
    },
    ImportDeclaration: function(node, scope) {
      for (var i = 0; i < node.specifiers.length; i++)
        addVar(scope, node.specifiers[i].local);
    }
  });
  scopeGatherer.ForOfStatement = scopeGatherer.ForInStatement;

  function rmScope(node) { if (node.scope) node.scope = null }
  var scopeClearer = {BlockStatement: rmScope, Function: rmScope, CatchClause: rmScope,
                      ForInStateMent: rmScope, ForStatement: rmScope};
  exports.clearScopes = function(ast) {
    walk.simple(ast, scopeClearer);
  };

  // CONSTRAINT GATHERING PASS

  var propName = exports.propName = function(node, inferInScope) {
    var key = node.property || node.key;
    if (!node.computed && key.type == "Identifier") return key.name;
    if (key.type == "Literal") {
      if (typeof key.value == "string") return key.value;
      if (typeof key.value == "number") return String(key.value);
    }
    if (inferInScope) {
      var symName = symbolName(infer(key, inferInScope));
      if (symName) return node.propName = symName;
    } else if (node.propName) {
      return node.propName;
    }
    return "<i>";
  };
  function symbolName(val) {
    var sym = val.getSymbolType();
    if (sym) return sym.asPropName();
  }

  function unopResultType(op) {
    switch (op) {
    case "+": case "-": case "~": return cx.num;
    case "!": return cx.bool;
    case "typeof": return cx.str;
    case "void": case "delete": return ANull;
    }
  }
  function binopIsBoolean(op) {
    switch (op) {
    case "==": case "!=": case "===": case "!==": case "<": case ">": case ">=": case "<=":
    case "in": case "instanceof": return true;
    }
  }
  function literalType(node) {
    if (node.regex) return getInstance(cx.protos.RegExp);
    switch (typeof node.value) {
    case "boolean": return cx.bool;
    case "number": return cx.num;
    case "string": return cx.str;
    case "object":
    case "function":
      if (!node.value) return ANull;
      return getInstance(cx.protos.RegExp);
    }
  }

  function join(a, b) {
    if (a == b || b == ANull) return a;
    if (a == ANull) return b;
    var joined = new AVal;
    a.propagate(joined);
    b.propagate(joined);
    return joined;
  }

  function connectParams(node, scope) {
    for (var i = 0; i < node.params.length; i++) {
      var param = node.params[i];
      if (param.type == "Identifier") continue;
      connectPattern(param, scope, node.scope.fnType.args[i]);
    }
  }

  function ensureVar(node, scope) {
    return scope.hasProp(node.name) || cx.topScope.defProp(node.name, node);
  }

  var inferPatternVisitor = exports.inferPatternVisitor = {
    Identifier: function(node, scope, source) {
      source.propagate(ensureVar(node, scope));
    },
    MemberExpression: function(node, scope, source) {
      var obj = infer(node.object, scope);
      var pName = propName(node, scope);
      obj.propagate(new DefProp(pName, source, node.property));
    },
    RestElement: function(node, scope, source) {
      connectPattern(node.argument, scope, new Arr(source));
    },
    ObjectPattern: function(node, scope, source) {
      for (var i = 0; i < node.properties.length; ++i) {
        var prop = node.properties[i];
        if (prop.type == 'RestElement') { continue; }
        connectPattern(prop.value, scope, source.getProp(propName(prop)));
      }
    },
    ArrayPattern: function(node, scope, source) {
      for (var i = 0; i < node.elements.length; i++)
        if (node.elements[i])
          connectPattern(node.elements[i], scope, source.getProp(String(i)));
    },
    AssignmentPattern: function(node, scope, source) {
      connectPattern(node.left, scope, join(source, infer(node.right, scope)));
    }
  };

  function connectPattern(node, scope, source) {
    var connecter = inferPatternVisitor[node.type];
    if (connecter) connecter(node, scope, source);
  }

  function getThis(scope) {
    var fnScope = functionScope(scope);
    return fnScope.fnType ? fnScope.fnType.self : fnScope;
  }

  function maybeAddPhantomObj(obj) {
    if (!obj.isEmpty() || !obj.propertyOf) return;
    obj.propertyOf.getProp(obj.propertyName).addType(new Obj, WG_PHANTOM_OBJ);
    maybeAddPhantomObj(obj.propertyOf);
  }

  function inferClass(node, scope, name) {
    if (!name && node.id) name = node.id.name;

    var sup = cx.protos.Object, supCtor, delayed;
    if (node.superClass) {
      if (node.superClass.type == "Literal" && node.superClass.value == null) {
        sup = null;
      } else {
        var supVal = infer(node.superClass, scope), supProto;
        supCtor = supVal.getFunctionType();
        if (supCtor && (supProto = supCtor.getProp("prototype").getObjType())) {
          sup = supProto;
        } else {
          supCtor = supVal;
          delayed = supVal.getProp("prototype");
        }
      }
    }
    var proto = new Obj(sup, name && name + ".prototype");
    if (delayed) delayed.propagate(new HasProto(proto));

    return withSuper(supCtor, delayed || sup, function() {
      var ctor, body = node.body.body;
      for (var i = 0; i < body.length; i++)
        if (body[i].kind == "constructor") ctor = body[i].value;
      var fn = node.objType = ctor ? infer(ctor, scope) : new Fn(name, ANull, [], null, ANull);
      fn.originNode = node.id || ctor || node;

      var inst = getInstance(proto, fn);
      fn.self.addType(inst);
      fn.defProp("prototype", node).addType(proto);
      for (var i = 0; i < body.length; i++) {
        var method = body[i], target;
        if (method.kind == "constructor") continue;
        var pName = propName(method, scope);
        if (pName == "<i>" || method.kind == "set") {
          target = ANull;
        } else {
          target = (method.static ? fn : proto).defProp(pName, method.key);
          target.initializer = true;
          if (method.kind == "get") target = new IsCallee(inst, [], null, target);
        }
        infer(method.value, scope, target);
        var methodFn = target.getFunctionType();
        if (methodFn) methodFn.self.addType(inst);
      }
      return fn;
    });
  }

  function arrayLiteralType(elements, scope, inner) {
    var tuple = elements.length > 1 && elements.length < 6;
    if (tuple) {
      var homogenous = true, litType;
      for (var i = 0; i < elements.length; i++) {
        var elt = elements[i];
        if (!elt)
          tuple = false;
        else if (elt.type != "Literal" || (litType && litType != typeof elt.value))
          homogenous = false;
        else
          litType = typeof elt.value;
      }
      if (homogenous) tuple = false;
    }

    if (tuple) {
      var types = [];
      for (var i = 0; i < elements.length; ++i)
        types.push(inner(elements[i], scope));
      return new Arr(types);
    } else if (elements.length < 2) {
      return new Arr(elements[0] && inner(elements[0], scope));
    } else {
      var eltVal = new AVal;
      for (var i = 0; i < elements.length; i++)
        if (elements[i]) inner(elements[i], scope).propagate(eltVal);
      return new Arr(eltVal);
    }
  }

  function ret(f) {
    return function(node, scope, out, name) {
      var r = f(node, scope, name);
      if (out) r.propagate(out);
      return r;
    };
  }
  function fill(f) {
    return function(node, scope, out, name) {
      if (!out) out = new AVal;
      f(node, scope, out, name);
      return out;
    };
  }

  var inferExprVisitor = exports.inferExprVisitor = {
    ArrayExpression: ret(function(node, scope) {
      return arrayLiteralType(node.elements, scope, infer);
    }),
    ObjectExpression: ret(function(node, scope, name) {
      var proto = cx.protos.Object, waitForProto;
      for (var i = 0; i < node.properties.length; ++i) {
        var prop = node.properties[i];
        if (prop.type == 'SpreadElement') { continue; }
        if (prop.key.name == "__proto__") {
          if (prop.value.type == "Literal" && prop.value.value == null) {
            proto = null;
          } else {
            var protoVal = infer(prop.value, scope), known = protoVal.getObjType();
            if (known) proto = known;
            else waitForProto = protoVal;
          }
        }
      }

      var obj = node.objType = new Obj(proto, name);
      if (waitForProto) waitForProto.propagate(new HasProto(obj));
      obj.originNode = node;

      withSuper(null, waitForProto || proto, function() {
        for (var i = 0; i < node.properties.length; ++i) {
          var prop = node.properties[i], key = prop.key;
          if (prop.type == 'SpreadElement' || ignoredProp(prop.key.name)) continue;

          var name = propName(prop, scope), target;
          if (name == "<i>" || prop.kind == "set") {
            target = ANull;
          } else {
            target = obj.defProp(name, key);
            var val = target;
            val.initializer = true;
            if (prop.kind == "get")
              target = new IsCallee(obj, [], null, val);
          }
          infer(prop.value, scope, target, name);
          if (prop.value.type == "FunctionExpression")
            prop.value.scope.fnType.self.addType(obj, WG_SPECULATIVE_THIS);
        }
      });
      return obj;
    }),
    FunctionExpression: ret(function(node, scope, name) {
      var inner = node.scope, fn = inner.fnType;
      if (name && !fn.name) fn.name = name;
      connectParams(node, inner);
      if (node.expression)
        infer(node.body, inner, inner.fnType.retval = new AVal);
      else
        walk.recursive(node.body, inner, null, inferWrapper, "Statement");
      if (node.type == "ArrowFunctionExpression")
        getThis(scope).propagate(fn.self);
      maybeTagAsInstantiated(node, fn) || maybeTagAsGeneric(fn);
      if (node.id) inner.getProp(node.id.name).addType(fn);
      return fn;
    }),
    ClassExpression: ret(inferClass),
    SequenceExpression: ret(function(node, scope) {
      for (var i = 0, l = node.expressions.length - 1; i < l; ++i)
        infer(node.expressions[i], scope, ANull);
      return infer(node.expressions[l], scope);
    }),
    UnaryExpression: ret(function(node, scope) {
      infer(node.argument, scope, ANull);
      return unopResultType(node.operator);
    }),
    UpdateExpression: ret(function(node, scope) {
      infer(node.argument, scope, ANull);
      return cx.num;
    }),
    BinaryExpression: ret(function(node, scope) {
      if (node.operator == "+") {
        var lhs = infer(node.left, scope);
        var rhs = infer(node.right, scope);
        if (lhs.hasType(cx.str) || rhs.hasType(cx.str)) return cx.str;
        if (lhs.hasType(cx.num) && rhs.hasType(cx.num)) return cx.num;
        var result = new AVal;
        lhs.propagate(new IsAdded(rhs, result));
        rhs.propagate(new IsAdded(lhs, result));
        return result;
      } else {
        infer(node.left, scope, ANull);
        infer(node.right, scope, ANull);
        return binopIsBoolean(node.operator) ? cx.bool : cx.num;
      }
    }),
    AssignmentExpression: ret(function(node, scope, name) {
      var rhs, pName;
      if (node.left.type == "MemberExpression") {
        pName = propName(node.left, scope);
        if (!name)
          name = node.left.object.type == "Identifier" ? node.left.object.name + "." + pName : pName;
      } else if (!name && node.left.type == "Identifier") {
        name = node.left.name;
      }

      if (node.operator && node.operator != "=" && node.operator != "+=") {
        infer(node.right, scope, ANull);
        rhs = cx.num;
      } else {
        rhs = infer(node.right, scope, null, name);
      }

      if (node.left.type == "MemberExpression") {
        var obj = infer(node.left.object, scope);
        if (pName == "prototype") maybeInstantiate(scope, 20);
        if (pName == "<i>") {
          // This is a hack to recognize for/in loops that copy
          // properties, and do the copying ourselves, insofar as we
          // manage, because such loops tend to be relevant for type
          // information.
          var v = node.left.property.name, local = scope.props[v], over = local && local.iteratesOver;
          if (over) {
            maybeInstantiate(scope, 20);
            var fromRight = node.right.type == "MemberExpression" && node.right.computed && node.right.property.name == v;
            over.forAllProps(function(prop, val, local) {
              if (local && prop != "prototype" && prop != "<i>")
                obj.propagate(new DefProp(prop, fromRight ? val : ANull));
            });
            return rhs;
          }
        }

        obj.propagate(new DefProp(pName, rhs, node.left.property));
        maybeAddPhantomObj(obj);
        if (node.right.type == "FunctionExpression")
          obj.propagate(node.right.scope.fnType.self, WG_SPECULATIVE_THIS);
      } else {
        connectPattern(node.left, scope, rhs);
      }
      return rhs;
    }),
    LogicalExpression: fill(function(node, scope, out) {
      infer(node.left, scope, out);
      infer(node.right, scope, out);
    }),
    ConditionalExpression: fill(function(node, scope, out) {
      infer(node.test, scope, ANull);
      infer(node.consequent, scope, out);
      infer(node.alternate, scope, out);
    }),
    NewExpression: fill(function(node, scope, out, name) {
      if (node.callee.type == "Identifier" && node.callee.name in scope.props)
        maybeInstantiate(scope, 20);

      for (var i = 0, args = []; i < node.arguments.length; ++i)
        args.push(infer(node.arguments[i], scope));
      var callee = infer(node.callee, scope);
      var self = new AVal;
      callee.propagate(new IsCtor(self, name && /\.prototype$/.test(name)));
      self.propagate(out, WG_NEW_INSTANCE);
      callee.propagate(new IsCallee(self, args, node.arguments, new IfObj(out)));
    }),
    CallExpression: fill(function(node, scope, out) {
      for (var i = 0, args = []; i < node.arguments.length; ++i)
        args.push(infer(node.arguments[i], scope));
      var outerFn = functionScope(scope).fnType;
      if (node.callee.type == "MemberExpression") {
        var self = infer(node.callee.object, scope);
        var pName = propName(node.callee, scope);
        if (outerFn && (pName == "call" || pName == "apply") &&
            outerFn.args.indexOf(self) > -1)
          maybeInstantiate(scope, 30);
        self.propagate(new HasMethodCall(pName, args, node.arguments, out));
      } else if (node.callee.type == "Super" && cx.curSuperCtor) {
        node.callee.superType = cx.curSuperCtor;
        cx.curSuperCtor.propagate(new IsCallee(getThis(scope), args, node.arguments, out));
        getThis(scope).propagate(out, WG_NEW_INSTANCE);
      } else {
        var callee = infer(node.callee, scope);
        if (outerFn && outerFn.args.indexOf(callee) > -1)
          maybeInstantiate(scope, 30);
        var knownFn = callee.getFunctionType();
        if (knownFn && knownFn.instantiateScore && outerFn)
          maybeInstantiate(scope, knownFn.instantiateScore / 5);
        callee.propagate(new IsCallee(cx.topScope, args, node.arguments, out));
      }
    }),
    AwaitExpression: fill(function(node, scope, out, name) {
      var arg = infer(node.argument, scope, null, name);
      var tp = arg.getType();
      if (tp && tp.constructor == Obj && tp.name == "Promise") {
        if (tp.hasProp(":t")) {
          tp.getProp(":t").propagate(out);
        }
      } else {
        arg.propagate(out);
      }
    }),
    MemberExpression: fill(function(node, scope, out) {
      var name = propName(node), wg;
      if (name == "<i>") {
        var propType = infer(node.property, scope);
        var symName = symbolName(propType);
        if (symName)
          name = node.propName = symName;
        else if (!propType.hasType(cx.num))
          wg = WG_MULTI_MEMBER;
      }
      infer(node.object, scope).getProp(name).propagate(out, wg);
    }),
    Identifier: ret(function(node, scope) {
      if (node.name == "arguments") {
        var fnScope = functionScope(scope, false);
        if (fnScope.fnType && !(node.name in fnScope.props))
          fnScope.defProp(node.name, fnScope.fnType.originNode)
            .addType(new Arr(fnScope.fnType.arguments = new AVal));
      }
      return scope.getProp(node.name);
    }),
    ThisExpression: ret(function(_node, scope) {
      return getThis(scope);
    }),
    Super: ret(function(node) {
      return node.superType = cx.curSuper || ANull;
    }),
    Literal: ret(function(node) {
      return literalType(node);
    }),
    TemplateLiteral: ret(function(node, scope) {
      for (var i = 0; i < node.expressions.length; ++i)
        infer(node.expressions[i], scope, ANull);
      return cx.str;
    }),
    TaggedTemplateExpression: fill(function(node, scope, out) {
      var args = [new Arr(cx.str)];
      for (var i = 0; i < node.quasi.expressions.length; ++i)
        args.push(infer(node.quasi.expressions[i], scope));
      infer(node.tag, scope, new IsCallee(cx.topScope, args, node.quasi.expressions, out));
    }),
    YieldExpression: ret(function(node, scope) {
      var output = ANull, fn = functionScope(scope).fnType;
      if (fn) {
        if (fn.retval == ANull) fn.retval = new AVal;
        if (!fn.yieldval) fn.yieldval = new AVal;
        output = fn.retval;
      }
      if (node.argument) {
        if (node.delegate) {
          infer(node.argument, scope, new HasMethodCall("next", [], null,
                                                        new GetProp("value", output)));
        } else {
          infer(node.argument, scope, output);
        }
      }
      return fn ? fn.yieldval : ANull;
    })
  };
  inferExprVisitor.ArrowFunctionExpression = inferExprVisitor.FunctionExpression;

  function infer(node, scope, out, name) {
    var handler = inferExprVisitor[node.type];
    return handler ? handler(node, scope, out, name) : ANull;
  }

  function loopPattern(init) {
    return init.type == "VariableDeclaration" ? init.declarations[0].id : init;
  }

  var inferWrapper = exports.inferWrapper = walk.make({
    Expression: function(node, scope) {
      infer(node, node.scope || scope, ANull);
    },

    ObjectExpression: function(node, scope) {
      infer(node, node.scope || scope, ANull);
    },

    FunctionDeclaration: function(node, scope, c) {
      var inner = node.scope, fn = inner.fnType;
      connectParams(node, inner);
      c(node.body, inner, "Statement");
      maybeTagAsInstantiated(node, fn) || maybeTagAsGeneric(fn);
      if (node.id) scope.getProp(node.id.name).addType(fn);
    },

    Statement: function(node, scope, c) {
      c(node, node.scope || scope);
    },

    ExportDefaultDeclaration: function(node, scope, c) {
      c(node.declaration, node.scope || scope);
    },

    VariableDeclaration: function(node, scope) {
      for (var i = 0; i < node.declarations.length; ++i) {
        var decl = node.declarations[i];
        if (decl.id.type == "Identifier") {
          var prop = scope.getProp(decl.id.name);
          if (decl.init)
            infer(decl.init, scope, prop, decl.id.name);
        } else if (decl.init) {
          connectPattern(decl.id, scope, infer(decl.init, scope));
        }
      }
    },

    ClassDeclaration: function(node, scope) {
      if (!node.id) inferClass(node, scope);
      else scope.getProp(node.id.name).addType(inferClass(node, scope, node.id.name));
    },

    ReturnStatement: function(node, scope) {
      if (!node.argument) return;
      var output = ANull, fn = functionScope(scope).fnType;
      if (fn) {
        if (fn.retval == ANull) fn.retval = new AVal;
        output = fn.retval;
      }
      infer(node.argument, scope, output);
    },

    ForInStatement: function(node, scope, c) {
      var source = infer(node.right, scope);
      if ((node.right.type == "Identifier" && node.right.name in scope.props) ||
          (node.right.type == "MemberExpression" && node.right.property.name == "prototype")) {
        maybeInstantiate(scope, 5);
        var pattern = loopPattern(node.left);
        if (pattern.type == "Identifier") {
          if (pattern.name in scope.props)
            scope.getProp(pattern.name).iteratesOver = source;
          source.getProp("<i>").propagate(ensureVar(pattern, scope));
        } else {
          connectPattern(pattern, scope, source.getProp("<i>"));
        }
      }
      c(node.body, scope, "Statement");
    },

    ForOfStatement: function(node, scope, c) {
      var pattern = loopPattern(node.left), target;
      if (pattern.type == "Identifier")
        target = ensureVar(pattern, scope);
      else
        connectPattern(pattern, scope, target = new AVal);

      if (node.await) {
        infer(node.right, scope, new HasMethodCall(":Symbol.asyncIterator", [], null,
                                                   new HasMethodCall("next", [], null,
                                                                     new GetProp(":t",
                                                                                 new GetProp("value", target)))));
      } else {
        infer(node.right, scope, new HasMethodCall(":Symbol.iterator", [], null,
                                                   new HasMethodCall("next", [], null,
                                                                     new GetProp("value", target))));
      }
      c(node.body, scope, "Statement");
    }
  });

  // PARSING

  var parse = exports.parse = function(text, options, thirdArg) {
    if (!options || Array.isArray(options)) options = thirdArg;
    var ast;
    try { ast = acorn.parse(text, options); }
    catch(e) { ast = acorn_loose.parse(text, options); }
    return ast;
  };

  // ANALYSIS INTERFACE

  exports.analyze = function(ast, name, scope) {
    if (typeof ast == "string") ast = parse(ast);

    if (!name) name = "file#" + cx.origins.length;
    exports.addOrigin(cx.curOrigin = name);

    if (!scope) scope = cx.topScope;
    cx.startAnalysis();

    walk.recursive(ast, scope, null, scopeGatherer);
    if (cx.parent) cx.parent.signal("preInfer", ast, scope);
    walk.recursive(ast, scope, null, inferWrapper);
    if (cx.parent) cx.parent.signal("postInfer", ast, scope);

    cx.curOrigin = null;
  };

  // PURGING

  exports.purge = function(origins, start, end) {
    var test = makePredicate(origins, start, end);
    ++cx.purgeGen;
    cx.topScope.purge(test);
    for (var prop in cx.props) {
      var list = cx.props[prop];
      for (var i = 0; i < list.length; ++i) {
        var obj = list[i], av = obj.props[prop];
        if (!av || test(av, av.originNode)) list.splice(i--, 1);
      }
      if (!list.length) delete cx.props[prop];
    }
  };

  function makePredicate(origins, start, end) {
    var arr = Array.isArray(origins);
    if (arr && origins.length == 1) { origins = origins[0]; arr = false; }
    if (arr) {
      if (end == null) return function(n) { return origins.indexOf(n.origin) > -1; };
      return function(n, pos) { return pos && pos.start >= start && pos.end <= end && origins.indexOf(n.origin) > -1; };
    } else {
      if (end == null) return function(n) { return n.origin == origins; };
      return function(n, pos) { return pos && pos.start >= start && pos.end <= end && n.origin == origins; };
    }
  }

  AVal.prototype.purge = function(test) {
    if (this.purgeGen == cx.purgeGen) return;
    this.purgeGen = cx.purgeGen;
    for (var i = 0; i < this.types.length; ++i) {
      var type = this.types[i];
      if (test(type, type.originNode))
        this.types.splice(i--, 1);
      else
        type.purge(test);
    }
    if (!this.types.length) this.maxWeight = 0;

    if (this.forward) for (var i = 0; i < this.forward.length; ++i) {
      var f = this.forward[i];
      if (test(f)) {
        this.forward.splice(i--, 1);
        if (this.props) this.props = null;
      } else if (f.purge) {
        f.purge(test);
      }
    }
  };
  ANull.purge = function() {};
  Obj.prototype.purge = function(test) {
    if (this.purgeGen == cx.purgeGen) return true;
    this.purgeGen = cx.purgeGen;
    for (var p in this.props) {
      var av = this.props[p];
      if (test(av, av.originNode))
        this.removeProp(p);
      av.purge(test);
    }
  };
  Fn.prototype.purge = function(test) {
    if (Obj.prototype.purge.call(this, test)) return;
    this.self.purge(test);
    this.retval.purge(test);
    for (var i = 0; i < this.args.length; ++i) this.args[i].purge(test);
  };

  // EXPRESSION TYPE DETERMINATION

  function findByPropertyName(name) {
    guessing = true;
    var found = objsWithProp(name);
    if (found) for (var i = 0; i < found.length; ++i) {
      var val = found[i].getProp(name);
      if (!val.isEmpty()) return val;
    }
    return ANull;
  }

  function generatorResult(input, output, async) {
    var defs = cx.definitions.ecmascript;
    var valObj = new Obj(true);
    valObj.defProp("done").addType(cx.bool);
    output.propagate(valObj.defProp("value"));
    var retObj = valObj;
    if (async && defs) {
      retObj = new Obj(defs["Promise.prototype"]);
      retObj.getType().propagate(new DefProp(':t', valObj));
    }
    var method = new Fn(null, ANull, input ? [input] : [], input ? ["?"] : [], retObj);
    var result = new Obj(defs ? async ? defs.async_generator_prototype : defs.generator_prototype : true);
    result.defProp("next").addType(method);
    return result;
  }

  function maybeIterator(fn, output) {
    if (!fn.generator) return output;
    if (!fn.computeRet) { // Reuse iterator objects for non-computed return types
      if (fn.generator === true) fn.generator = generatorResult(fn.yieldval, output, fn.async);
      return fn.generator;
    }
    return generatorResult(fn.yieldval, output, fn.async);
  }

  function computeReturnType(funcNode, argNodes, scope) {
    var fn = findType(funcNode, scope).getFunctionType();
    if (!fn) return ANull;
    var result = fn.retval;
    if (fn.computeRet) {
      for (var i = 0, args = []; i < argNodes.length; ++i)
        args.push(findType(argNodes[i], scope));
      var self = ANull;
      if (funcNode.type == "MemberExpression")
        self = findType(funcNode.object, scope);
      result = fn.computeRet(self, args, argNodes);
    }
    return maybeIterator(fn, result);
  }

  var typeFinder = exports.typeFinder = {
    ArrayExpression: function(node, scope) {
      return arrayLiteralType(node.elements, scope, findType);
    },
    ObjectExpression: function(node) {
      return node.objType;
    },
    ClassDeclaration: function(node) {
      return node.objType;
    },
    ClassExpression: function(node) {
      return node.objType;
    },
    FunctionDeclaration: function(node) {
      return node.scope.fnType;
    },
    FunctionExpression: function(node) {
      return node.scope.fnType;
    },
    ArrowFunctionExpression: function(node) {
      return node.scope.fnType;
    },
    SequenceExpression: function(node, scope) {
      return findType(node.expressions[node.expressions.length-1], scope);
    },
    UnaryExpression: function(node) {
      return unopResultType(node.operator);
    },
    UpdateExpression: function() {
      return cx.num;
    },
    BinaryExpression: function(node, scope) {
      if (binopIsBoolean(node.operator)) return cx.bool;
      if (node.operator == "+") {
        var lhs = findType(node.left, scope);
        var rhs = findType(node.right, scope);
        if (lhs.hasType(cx.str) || rhs.hasType(cx.str)) return cx.str;
      }
      return cx.num;
    },
    AssignmentExpression: function(node, scope) {
      return findType(node.right, scope);
    },
    LogicalExpression: function(node, scope) {
      var lhs = findType(node.left, scope);
      return lhs.isEmpty() ? findType(node.right, scope) : lhs;
    },
    ConditionalExpression: function(node, scope) {
      var lhs = findType(node.consequent, scope);
      return lhs.isEmpty() ? findType(node.alternate, scope) : lhs;
    },
    NewExpression: function(node, scope) {
      var f = findType(node.callee, scope).getFunctionType();
      var proto = f && f.getProp("prototype").getObjType();
      if (!proto) return ANull;
      return getInstance(proto, f);
    },
    CallExpression: function(node, scope) {
      return computeReturnType(node.callee, node.arguments, scope);
    },
    MemberExpression: function(node, scope) {
      var propN = propName(node), obj = findType(node.object, scope).getType();
      if (obj) return obj.getProp(propN);
      if (propN == "<i>") return ANull;
      return findByPropertyName(propN);
    },
    MethodDefinition: function(node) {
      var propN = propName(node), obj = getThis(node.value.scope).getType();
      if (obj) return obj.getProp(propN);
      return ANull;
    },
    Identifier: function(node, scope) {
      return scope.hasProp(node.name) || ANull;
    },
    ThisExpression: function(_node, scope) {
      return getThis(scope);
    },
    Literal: function(node) {
      return literalType(node);
    },
    Super: ret(function(node) {
      return node.superType;
    }),
    TemplateLiteral: function() {
      return cx.str;
    },
    TaggedTemplateExpression: function(node, scope) {
      return computeReturnType(node.tag, node.quasi.expressions, scope);
    },
    YieldExpression: function(_node, scope) {
      var fn = functionScope(scope).fnType;
      return fn ? fn.yieldval : ANull;
    }
  };

  function findType(node, scope) {
    var finder = typeFinder[node.type];
    return finder ? finder(node, scope) : ANull;
  }

  var searchVisitor = exports.searchVisitor = walk.make({
    Function: function(node, _st, c) {
      walk.base.Function(node, node.scope, c);
    },
    CatchClause: function(node, _st, c) {
      walk.base.CatchClause(node, node.scope, c);
    },
    Property: function(node, st, c) {
      if (node.computed) c(node.key, st, "Expression");
      if (node.key != node.value) c(node.value, st, "Expression");
    },
    Statement: function(node, st, c) {
      c(node, node.scope || st);
    },
    ImportSpecifier: function(node, st, c) {
      c(node.local, st);
    },
    ImportDefaultSpecifier: function(node, st, c) {
      c(node.local, st);
    },
    ImportNamespaceSpecifier: function(node, st, c) {
      c(node.local, st);
    }
  });
  var searchExprVisitor = exports.searchExprVisitor = walk.make({
    MemberExpression: function(node, st, c) {
      c(node.object, st, "Expression");
      if (node.computed) { c(node.property, st, "Expression"); }
    },
    Property: function(node, st, c) {
      if (node.computed) c(node.key, st, "Expression");
      c(node.value, st, "Expression");
    }
  }, searchVisitor);
  exports.fullVisitor = walk.make({
    MemberExpression: function(node, st, c) {
      c(node.object, st, "Expression");
      c(node.property, st, node.computed ? "Expression" : null);
    },
    Property: function(node, st, c) {
      if (node.computed) c(node.key, st, "Expression");
      c(node.value, st, "Expression");
    }
  }, searchVisitor);

  exports.findExpressionAt = function(ast, start, end, defaultScope, filter) {
    var test = filter || function(_t, node) {
      if (node.type == "Identifier" && node.name == "✖") return false;
      return typeFinder.hasOwnProperty(node.type);
    };
    return walk.findNodeAt(ast, start, end, test, searchExprVisitor, defaultScope || cx.topScope);
  };
  exports.findClosestExpression = function(ast, start, end, defaultScope, filter) {
    var test = filter || function(_t, node) {
      if (start != null && node.start > start) return false;
      if (node.type == "Identifier" && node.name == "✖") return false;
      return typeFinder.hasOwnProperty(node.type);
    };
    return walk.findNodeAround(ast, end, test, searchExprVisitor, defaultScope || cx.topScope);
  };

  exports.findExpressionAround = function(ast, start, end, defaultScope, filter) {
    var test = filter || function(_t, node) {
      if (start != null && node.start > start) return false;
      if (node.type == "Identifier" && node.name == "✖") return false;
      return typeFinder.hasOwnProperty(node.type);
    };
    return walk.findNodeAround(ast, end, test, searchVisitor, defaultScope || cx.topScope);
  };

  exports.expressionType = function(found) {
    return findType(found.node, found.state);
  };

  // Finding the expected type of something, from context

  exports.parentNode = function(child, ast) {
    var stack = [];
    function c(node, st, override) {
      if (node.start <= child.start && node.end >= child.end) {
        var top = stack[stack.length - 1];
        if (node == child) throw {found: top};
        if (top != node) stack.push(node);
        walk.base[override || node.type](node, st, c);
        if (top != node) stack.pop();
      }
    }
    try {
      c(ast, null);
    } catch (e) {
      if (e.found) return e.found;
      throw e;
    }
  };

  var findTypeFromContext = exports.findTypeFromContext = {
    ArrayExpression: function(parent, _, get) { return get(parent, true).getProp("<i>"); },
    ObjectExpression: function(parent, node, get) {
      for (var i = 0; i < parent.properties.length; ++i) {
        var prop = node.properties[i];
        if (prop.value == node)
          return get(parent, true).getProp(propName(prop));
      }
    },
    UnaryExpression: function(parent) { return unopResultType(parent.operator); },
    UpdateExpression: function() { return cx.num; },
    BinaryExpression: function(parent) { return binopIsBoolean(parent.operator) ? cx.bool : cx.num; },
    AssignmentExpression: function(parent, _, get) { return get(parent.left); },
    LogicalExpression: function(parent, _, get) { return get(parent, true); },
    ConditionalExpression: function(parent, node, get) {
      if (parent.consequent == node || parent.alternate == node) return get(parent, true);
    },
    CallExpression: function(parent, node, get) {
      for (var i = 0; i < parent.arguments.length; i++) {
        var arg = parent.arguments[i];
        if (arg == node) {
          var calleeType = get(parent.callee).getFunctionType();
          if (calleeType instanceof Fn)
            return calleeType.args[i];
          break;
        }
      }
    },
    ReturnStatement: function(_parent, node, get) {
      // tweaking search position to avoid endless recursion
      // when looking for definition of key in fn ( return fn ( return object ) )
      // see ternjs/tern#777
      var fnNode = walk.findNodeAround(node.sourceFile.ast, node.start - 1, "Function");
      if (fnNode) {
        var fnType = fnNode.node.type != "FunctionDeclaration"
          ? get(fnNode.node, true).getFunctionType()
          : fnNode.node.scope.fnType;
        if (fnType) return fnType.retval.getType();
      }
    },
    VariableDeclarator: function(parent, node, get) {
      if (parent.init == node) return get(parent.id);
    }
  };
  findTypeFromContext.NewExpression = findTypeFromContext.CallExpression;

  exports.typeFromContext = function(ast, found) {
    var parent = exports.parentNode(found.node, ast);
    var type = null;
    if (findTypeFromContext.hasOwnProperty(parent.type)) {
      var finder = findTypeFromContext[parent.type];
      type = finder && finder(parent, found.node, function(node, fromContext) {
        var obj = {node: node, state: found.state};
        var tp = fromContext ? exports.typeFromContext(ast, obj) : exports.expressionType(obj);
        return tp || ANull;
      });
    }
    return type || exports.expressionType(found);
  };

  // Flag used to indicate that some wild guessing was used to produce
  // a type or set of completions.
  var guessing = false;

  exports.resetGuessing = function(val) { guessing = val; };
  exports.didGuess = function() { return guessing; };

  exports.forAllPropertiesOf = function(type, f) {
    type.gatherProperties(f, 0);
  };

  exports.findRefs = function(ast, baseScope, name, refScope, f) {
    function handleId(node, scope, ancestors) {
      var parent = ancestors[ancestors.length - 2];
      if (parent.type == "MemberExpression" && !parent.computed && !!node.object) return;
      if (node.name != name ||
          (node == ast.id && ast.type == "FunctionDeclaration")) return;
      if (parent.property === node) return;
      for (var s = scope; s; s = s.prev) {
        if (s == refScope) f(node, scope, ancestors);
        if (name in s.props) return;
      }
    }
    walk.ancestor(ast, {Identifier: handleId, VariablePattern: handleId},
                  exports.fullVisitor, baseScope);
  };

  var simpleWalker = walk.make({
    Function: function(node, _scope, c) {
      c(node.body, node.scope, node.expression ? "Expression" : "Statement");
    },
    Statement: function(node, scope, c) {
      c(node, node.scope || scope);
    }
  });

  exports.findPropRefs = function(ast, scope, objType, name, f) {
    // Find the type which owns the property in hierarchy
    while (objType && !objType.props[name] && !(objType.maybeProps && objType.maybeProps[name])) {
      objType = objType.proto;
    }
    if (!objType) throw new Error("Couldn't locate property in the base object type.");

    function isObjTypeProto(type) {
      // Check whether the found type has objType in its hierarchy
      while (type && type != objType) {
        // Ff property is overriden higher in the hierarchy, return false
        if (type.props[name] || (type.maybeProps && type.maybeProps[name])) {
          return false;
        }
        type = type.proto;
      }
      return type;
    }

    walk.simple(ast, {
      MemberExpression: function(node, scope) {
        if (node.computed || propName(node) != name) return;
        if (isObjTypeProto(findType(node.object, scope).getType())) f(node.property, scope);
      },
      ObjectExpression: function(node, scope) {
        if (findType(node, scope).getType() != objType) return;
        for (var i = 0; i < node.properties.length; ++i)
          if (propName(node.properties[i]) == name) f(node.properties[i].key, scope);
      },
      MethodDefinition: function(node) {
        if (propName(node) != name) return;
        if (node.value && isObjTypeProto(getThis(node.value.scope).getType())) f(node.key, node.value.scope);
      }
    }, simpleWalker, scope);
  };

  // LOCAL-VARIABLE QUERIES

  var scopeAt = exports.scopeAt = function(ast, pos, defaultScope) {
    var found = walk.findNodeAround(ast, pos, function(_, node) {
      return node.scope;
    });
    if (found) return found.node.scope;
    else return defaultScope || cx.topScope;
  };

  exports.forAllLocalsAt = function(ast, pos, defaultScope, f) {
    var scope = scopeAt(ast, pos, defaultScope);
    scope.gatherProperties(f, 0);
  };

  // INIT DEF MODULE

  // Delayed initialization because of cyclic dependencies.
  def = exports.def = def.init({}, exports);
});
