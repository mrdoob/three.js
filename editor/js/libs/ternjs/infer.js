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
    return mod(exports, require("acorn"), require("acorn/dist/acorn_loose"), require("acorn/dist/walk"),
               require("./def"), require("./signal"));
  if (typeof define == "function" && define.amd) // AMD
    return define(["exports", "acorn/dist/acorn", "acorn/dist/acorn_loose", "acorn/dist/walk", "./def", "./signal"], mod);
  mod(root.tern || (root.tern = {}), acorn, acorn, acorn.walk, tern.def, tern.signal); // Plain browser env
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

  var WG_DEFAULT = 100, WG_NEW_INSTANCE = 90, WG_MADEUP_PROTO = 10, WG_MULTI_MEMBER = 5,
      WG_CATCH_ERROR = 5, WG_GLOBAL_THIS = 90, WG_SPECULATIVE_THIS = 2;

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
      if (prop == "__proto__" || prop == "✖") return ANull;
      var found = (this.props || (this.props = Object.create(null)))[prop];
      if (!found) {
        found = this.props[prop] = new AVal;
        this.propagate(new PropIsSubset(prop, found));
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

    computedPropType: function() {
      if (!this.propertyOf) return null;
      if (this.propertyOf.hasProp("<i>")) {
        var computedProp = this.propertyOf.getProp("<i>");
        if (computedProp == this) return null;
        return computedProp.getType();
      } else if (this.propertyOf.maybeProps && this.propertyOf.maybeProps["<i>"] == this) {
        for (var prop in this.propertyOf.props) {
          var val = this.propertyOf.props[prop];
          if (!val.isEmpty()) return val;
        }
        return null;
      }
    },

    makeupType: function() {
      var computed = this.computedPropType();
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
    if (a == b) return a;
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

  function Constraint() {}
  Constraint.prototype = extend(ANull, {
    init: function() { this.origin = cx.curOrigin; }
  });

  var constraint = exports.constraint = function(props, methods) {
    var body = "this.init();";
    props = props ? props.split(", ") : [];
    for (var i = 0; i < props.length; ++i)
      body += "this." + props[i] + " = " + props[i] + ";";
    var ctor = Function.apply(null, props.concat([body]));
    ctor.prototype = Object.create(Constraint.prototype);
    for (var m in methods) if (methods.hasOwnProperty(m)) ctor.prototype[m] = methods[m];
    return ctor;
  };

  var PropIsSubset = constraint("prop, target", {
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

  var PropHasSubset = exports.PropHasSubset = constraint("prop, type, originNode", {
    addType: function(type, weight) {
      if (!(type instanceof Obj)) return;
      var prop = type.defProp(this.prop, this.originNode);
      if (!prop.origin) prop.origin = this.origin;
      this.type.propagate(prop, weight);
    },
    propHint: function() { return this.prop; }
  });

  var ForAllProps = constraint("c", {
    addType: function(type) {
      if (!(type instanceof Obj)) return;
      type.forAllProps(this.c);
    }
  });

  function withDisabledComputing(fn, body) {
    cx.disabledComputing = {fn: fn, prev: cx.disabledComputing};
    try {
      return body();
    } finally {
      cx.disabledComputing = cx.disabledComputing.prev;
    }
  }
  var IsCallee = exports.IsCallee = constraint("self, args, argNodes, retval", {
    init: function() {
      Constraint.prototype.init.call(this);
      this.disabled = cx.disabledComputing;
    },
    addType: function(fn, weight) {
      if (!(fn instanceof Fn)) return;
      for (var i = 0; i < this.args.length; ++i) {
        if (i < fn.args.length) this.args[i].propagate(fn.args[i], weight);
        if (fn.arguments) this.args[i].propagate(fn.arguments, weight);
      }
      this.self.propagate(fn.self, this.self == cx.topScope ? WG_GLOBAL_THIS : weight);
      var compute = fn.computeRet;
      if (compute) for (var d = this.disabled; d; d = d.prev)
        if (d.fn == fn || fn.originNode && d.fn.originNode == fn.originNode) compute = null;
      if (compute)
        compute(this.self, this.args, this.argNodes).propagate(this.retval, weight);
      else
        fn.retval.propagate(this.retval, weight);
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

  var HasMethodCall = constraint("propName, args, argNodes, retval", {
    init: function() {
      Constraint.prototype.init.call(this);
      this.disabled = cx.disabledComputing;
    },
    addType: function(obj, weight) {
      var callee = new IsCallee(obj, this.args, this.argNodes, this.retval);
      callee.disabled = this.disabled;
      obj.getProp(this.propName).propagate(callee, weight);
    },
    propHint: function() { return this.propName; }
  });

  var IsCtor = exports.IsCtor = constraint("target, noReuse", {
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

  var IsProto = exports.IsProto = constraint("ctor, target", {
    addType: function(o, _weight) {
      if (!(o instanceof Obj)) return;
      if ((this.count = (this.count || 0) + 1) > 8) return;
      if (o == cx.protos.Array)
        this.target.addType(new Arr);
      else
        this.target.addType(getInstance(o, this.ctor));
    }
  });

  var FnPrototype = constraint("fn", {
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

  var IsAdded = constraint("other, target", {
    addType: function(type, weight) {
      if (type == cx.str)
        this.target.addType(cx.str, weight);
      else if (type == cx.num && this.other.hasType(cx.num))
        this.target.addType(cx.num, weight);
    },
    typeHint: function() { return this.other; }
  });

  var IfObj = exports.IfObj = constraint("target", {
    addType: function(t, weight) {
      if (t instanceof Obj) this.target.addType(t, weight);
    },
    propagatesTo: function() { return this.target; }
  });

  var SpeculativeThis = constraint("obj, ctor", {
    addType: function(tp) {
      if (tp instanceof Fn && tp.self && tp.self.isEmpty())
        tp.self.addType(getInstance(this.obj, this.ctor), WG_SPECULATIVE_THIS);
    }
  });

  var Muffle = constraint("inner, weight", {
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

  var Obj = exports.Obj = function(proto, name) {
    if (!this.props) this.props = Object.create(null);
    this.proto = proto === true ? cx.protos.Object : proto;
    if (proto && !name && proto.name && !(this instanceof Fn)) {
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
      if (prop == "__proto__" || prop == "✖") return ANull;

      var av = this.maybeProps && this.maybeProps[prop];
      if (av) {
        delete this.maybeProps[prop];
        this.maybeUnregProtoPropHandler();
      } else {
        av = new AVal;
        av.propertyOf = this;
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
      if (prop == "__proto__" || prop == "✖") return ANull;
      var av = this.ensureMaybeProps()[prop] = new AVal;
      av.propertyOf = this;
      return av;
    },
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
      for (var prop in this.props) if (prop != "<i>")
        f(prop, this, depth);
      if (this.proto) this.proto.gatherProperties(f, depth + 1);
    },
    getObjType: function() { return this; }
  });

  var Fn = exports.Fn = function(name, self, args, argNames, retval) {
    Obj.call(this, cx.protos.Function, name);
    this.self = self;
    this.args = args;
    this.argNames = argNames;
    this.retval = retval;
  };
  Fn.prototype = extend(Obj.prototype, {
    constructor: Fn,
    toString: function(maxDepth) {
      if (maxDepth == null) maxDepth = 0;
      var str = "fn(";
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
    getFunctionType: function() { return this; }
  });

  var Arr = exports.Arr = function(contentType) {
    Obj.call(this, cx.protos.Array);
    var content = this.defProp("<i>");
    if (contentType) contentType.propagate(content);
  };
  Arr.prototype = extend(Obj.prototype, {
    constructor: Arr,
    toString: function(maxDepth) {
      if (maxDepth == null) maxDepth = 0;
      return "[" + (maxDepth > -3 ? toString(this.getProp("<i>"), maxDepth - 1, this) : "?") + "]";
    }
  });

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
    this.curOrigin = "ecma5";
    this.paths = Object.create(null);
    this.definitions = Object.create(null);
    this.purgeGen = 0;
    this.workList = null;
    this.disabledComputing = null;

    exports.withContext(this, function() {
      cx.protos.Object = new Obj(null, "Object.prototype");
      cx.topScope = new Scope();
      cx.topScope.name = "<top>";
      cx.protos.Array = new Obj(true, "Array.prototype");
      cx.protos.Function = new Obj(true, "Function.prototype");
      cx.protos.RegExp = new Obj(true, "RegExp.prototype");
      cx.protos.String = new Obj(true, "String.prototype");
      cx.protos.Number = new Obj(true, "Number.prototype");
      cx.protos.Boolean = new Obj(true, "Boolean.prototype");
      cx.str = new Prim(cx.protos.String, "string");
      cx.bool = new Prim(cx.protos.Boolean, "bool");
      cx.num = new Prim(cx.protos.Number, "number");
      cx.curOrigin = null;

      if (defs) for (var i = 0; i < defs.length; ++i)
        def.load(defs[i]);
    });
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
    try {
      var ret = f(add);
      for (var i = 0; i < list.length; i += 4) {
        if (timeout && +new Date >= timeout)
          throw new exports.TimedOut();
        depth = list[i + 3] + 1;
        list[i + 1].addType(list[i], list[i + 2]);
      }
      return ret;
    } finally {
      cx.workList = null;
    }
  }

  // SCOPES

  var Scope = exports.Scope = function(prev) {
    Obj.call(this, prev || true);
    this.prev = prev;
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

  // RETVAL COMPUTATION HEURISTICS

  function maybeInstantiate(scope, score) {
    if (scope.fnType)
      scope.fnType.instantiateScore = (scope.fnType.instantiateScore || 0) + score;
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

  function maybeTagAsInstantiated(node, scope) {
    var score = scope.fnType.instantiateScore;
    if (!cx.disabledComputing && score && scope.fnType.args.length && nodeSmallerThan(node, score * 5)) {
      maybeInstantiate(scope.prev, score / 2);
      setFunctionInstantiated(node, scope);
      return true;
    } else {
      scope.fnType.instantiateScore = null;
    }
  }

  function setFunctionInstantiated(node, scope) {
    var fn = scope.fnType;
    // Disconnect the arg avals, so that we can add info to them without side effects
    for (var i = 0; i < fn.args.length; ++i) fn.args[i] = new AVal;
    fn.self = new AVal;
    fn.computeRet = function(self, args) {
      // Prevent recursion
      return withDisabledComputing(fn, function() {
        var oldOrigin = cx.curOrigin;
        cx.curOrigin = fn.origin;
        var scopeCopy = new Scope(scope.prev);
        scopeCopy.originNode = scope.originNode;
        for (var v in scope.props) {
          var local = scopeCopy.defProp(v, scope.props[v].originNode);
          for (var i = 0; i < args.length; ++i) if (fn.argNames[i] == v && i < args.length)
            args[i].propagate(local);
        }
        var argNames = fn.argNames.length != args.length ? fn.argNames.slice(0, args.length) : fn.argNames;
        while (argNames.length < args.length) argNames.push("?");
        scopeCopy.fnType = new Fn(fn.name, self, args, argNames, ANull);
        scopeCopy.fnType.originNode = fn.originNode;
        if (fn.arguments) {
          var argset = scopeCopy.fnType.arguments = new AVal;
          scopeCopy.defProp("arguments").addType(new Arr(argset));
          for (var i = 0; i < args.length; ++i) args[i].propagate(argset);
        }
        node.body.scope = scopeCopy;
        walk.recursive(node.body, scopeCopy, null, scopeGatherer);
        walk.recursive(node.body, scopeCopy, null, inferWrapper);
        cx.curOrigin = oldOrigin;
        return scopeCopy.fnType.retval;
      });
    };
  }

  function maybeTagAsGeneric(scope) {
    var fn = scope.fnType, target = fn.retval;
    if (target == ANull) return;
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

  var scopeGatherer = walk.make({
    Function: function(node, scope, c) {
      var inner = node.body.scope = new Scope(scope);
      inner.originNode = node;
      var argVals = [], argNames = [];
      for (var i = 0; i < node.params.length; ++i) {
        var param = node.params[i];
        argNames.push(param.name);
        argVals.push(addVar(inner, param));
      }
      inner.fnType = new Fn(node.id && node.id.name, new AVal, argVals, argNames, ANull);
      inner.fnType.originNode = node;
      if (node.id) {
        var decl = node.type == "FunctionDeclaration";
        addVar(decl ? scope : inner, node.id);
      }
      c(node.body, inner, "ScopeBody");
    },
    TryStatement: function(node, scope, c) {
      c(node.block, scope, "Statement");
      if (node.handler) {
        var v = addVar(scope, node.handler.param);
        c(node.handler.body, scope, "ScopeBody");
        var e5 = cx.definitions.ecma5;
        if (e5 && v.isEmpty()) getInstance(e5["Error.prototype"]).propagate(v, WG_CATCH_ERROR);
      }
      if (node.finalizer) c(node.finalizer, scope, "Statement");
    },
    VariableDeclaration: function(node, scope, c) {
      for (var i = 0; i < node.declarations.length; ++i) {
        var decl = node.declarations[i];
        addVar(scope, decl.id);
        if (decl.init) c(decl.init, scope, "Expression");
      }
    }
  });

  // CONSTRAINT GATHERING PASS

  function propName(node, scope, c) {
    var prop = node.property;
    if (!node.computed) return prop.name;
    if (prop.type == "Literal" && typeof prop.value == "string") return prop.value;
    if (c) infer(prop, scope, c, ANull);
    return "<i>";
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

  function ret(f) {
    return function(node, scope, c, out, name) {
      var r = f(node, scope, c, name);
      if (out) r.propagate(out);
      return r;
    };
  }
  function fill(f) {
    return function(node, scope, c, out, name) {
      if (!out) out = new AVal;
      f(node, scope, c, out, name);
      return out;
    };
  }

  var inferExprVisitor = {
    ArrayExpression: ret(function(node, scope, c) {
      var eltval = new AVal;
      for (var i = 0; i < node.elements.length; ++i) {
        var elt = node.elements[i];
        if (elt) infer(elt, scope, c, eltval);
      }
      return new Arr(eltval);
    }),
    ObjectExpression: ret(function(node, scope, c, name) {
      var obj = node.objType = new Obj(true, name);
      obj.originNode = node;

      for (var i = 0; i < node.properties.length; ++i) {
        var prop = node.properties[i], key = prop.key, name;
        if (prop.value.name == "✖") continue;

        if (key.type == "Identifier") {
          name = key.name;
        } else if (typeof key.value == "string") {
          name = key.value;
        }
        if (!name || prop.kind == "set") {
          infer(prop.value, scope, c, ANull);
          continue;
        }

        var val = obj.defProp(name, key), out = val;
        val.initializer = true;
        if (prop.kind == "get")
          out = new IsCallee(obj, [], null, val);
        infer(prop.value, scope, c, out, name);
      }
      return obj;
    }),
    FunctionExpression: ret(function(node, scope, c, name) {
      var inner = node.body.scope, fn = inner.fnType;
      if (name && !fn.name) fn.name = name;
      c(node.body, scope, "ScopeBody");
      maybeTagAsInstantiated(node, inner) || maybeTagAsGeneric(inner);
      if (node.id) inner.getProp(node.id.name).addType(fn);
      return fn;
    }),
    SequenceExpression: ret(function(node, scope, c) {
      for (var i = 0, l = node.expressions.length - 1; i < l; ++i)
        infer(node.expressions[i], scope, c, ANull);
      return infer(node.expressions[l], scope, c);
    }),
    UnaryExpression: ret(function(node, scope, c) {
      infer(node.argument, scope, c, ANull);
      return unopResultType(node.operator);
    }),
    UpdateExpression: ret(function(node, scope, c) {
      infer(node.argument, scope, c, ANull);
      return cx.num;
    }),
    BinaryExpression: ret(function(node, scope, c) {
      if (node.operator == "+") {
        var lhs = infer(node.left, scope, c);
        var rhs = infer(node.right, scope, c);
        if (lhs.hasType(cx.str) || rhs.hasType(cx.str)) return cx.str;
        if (lhs.hasType(cx.num) && rhs.hasType(cx.num)) return cx.num;
        var result = new AVal;
        lhs.propagate(new IsAdded(rhs, result));
        rhs.propagate(new IsAdded(lhs, result));
        return result;
      } else {
        infer(node.left, scope, c, ANull);
        infer(node.right, scope, c, ANull);
        return binopIsBoolean(node.operator) ? cx.bool : cx.num;
      }
    }),
    AssignmentExpression: ret(function(node, scope, c) {
      var rhs, name, pName;
      if (node.left.type == "MemberExpression") {
        pName = propName(node.left, scope, c);
        if (node.left.object.type == "Identifier")
          name = node.left.object.name + "." + pName;
      } else {
        name = node.left.name;
      }

      if (node.operator != "=" && node.operator != "+=") {
        infer(node.right, scope, c, ANull);
        rhs = cx.num;
      } else {
        rhs = infer(node.right, scope, c, null, name);
      }

      if (node.left.type == "MemberExpression") {
        var obj = infer(node.left.object, scope, c);
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
                obj.propagate(new PropHasSubset(prop, fromRight ? val : ANull));
            });
            return rhs;
          }
        }
        obj.propagate(new PropHasSubset(pName, rhs, node.left.property));
      } else { // Identifier
        rhs.propagate(scope.defVar(node.left.name, node.left));
      }
      return rhs;
    }),
    LogicalExpression: fill(function(node, scope, c, out) {
      infer(node.left, scope, c, out);
      infer(node.right, scope, c, out);
    }),
    ConditionalExpression: fill(function(node, scope, c, out) {
      infer(node.test, scope, c, ANull);
      infer(node.consequent, scope, c, out);
      infer(node.alternate, scope, c, out);
    }),
    NewExpression: fill(function(node, scope, c, out, name) {
      if (node.callee.type == "Identifier" && node.callee.name in scope.props)
        maybeInstantiate(scope, 20);

      for (var i = 0, args = []; i < node.arguments.length; ++i)
        args.push(infer(node.arguments[i], scope, c));
      var callee = infer(node.callee, scope, c);
      var self = new AVal;
      callee.propagate(new IsCtor(self, name && /\.prototype$/.test(name)));
      self.propagate(out, WG_NEW_INSTANCE);
      callee.propagate(new IsCallee(self, args, node.arguments, new IfObj(out)));
    }),
    CallExpression: fill(function(node, scope, c, out) {
      for (var i = 0, args = []; i < node.arguments.length; ++i)
        args.push(infer(node.arguments[i], scope, c));
      if (node.callee.type == "MemberExpression") {
        var self = infer(node.callee.object, scope, c);
        var pName = propName(node.callee, scope, c);
        if ((pName == "call" || pName == "apply") &&
            scope.fnType && scope.fnType.args.indexOf(self) > -1)
          maybeInstantiate(scope, 30);
        self.propagate(new HasMethodCall(pName, args, node.arguments, out));
      } else {
        var callee = infer(node.callee, scope, c);
        if (scope.fnType && scope.fnType.args.indexOf(callee) > -1)
          maybeInstantiate(scope, 30);
        var knownFn = callee.getFunctionType();
        if (knownFn && knownFn.instantiateScore && scope.fnType)
          maybeInstantiate(scope, knownFn.instantiateScore / 5);
        callee.propagate(new IsCallee(cx.topScope, args, node.arguments, out));
      }
    }),
    MemberExpression: fill(function(node, scope, c, out) {
      var name = propName(node, scope);
      var obj = infer(node.object, scope, c);
      var prop = obj.getProp(name);
      if (name == "<i>") {
        var propType = infer(node.property, scope, c);
        if (!propType.hasType(cx.num))
          return prop.propagate(out, WG_MULTI_MEMBER);
      }
      prop.propagate(out);
    }),
    Identifier: ret(function(node, scope) {
      if (node.name == "arguments" && scope.fnType && !(node.name in scope.props))
        scope.defProp(node.name, scope.fnType.originNode)
          .addType(new Arr(scope.fnType.arguments = new AVal));
      return scope.getProp(node.name);
    }),
    ThisExpression: ret(function(_node, scope) {
      return scope.fnType ? scope.fnType.self : cx.topScope;
    }),
    Literal: ret(function(node) {
      return literalType(node);
    })
  };

  function infer(node, scope, c, out, name) {
    return inferExprVisitor[node.type](node, scope, c, out, name);
  }

  var inferWrapper = walk.make({
    Expression: function(node, scope, c) {
      infer(node, scope, c, ANull);
    },

    FunctionDeclaration: function(node, scope, c) {
      var inner = node.body.scope, fn = inner.fnType;
      c(node.body, scope, "ScopeBody");
      maybeTagAsInstantiated(node, inner) || maybeTagAsGeneric(inner);
      var prop = scope.getProp(node.id.name);
      prop.addType(fn);
    },

    VariableDeclaration: function(node, scope, c) {
      for (var i = 0; i < node.declarations.length; ++i) {
        var decl = node.declarations[i], prop = scope.getProp(decl.id.name);
        if (decl.init)
          infer(decl.init, scope, c, prop, decl.id.name);
      }
    },

    ReturnStatement: function(node, scope, c) {
      if (!node.argument) return;
      var output = ANull;
      if (scope.fnType) {
        if (scope.fnType.retval == ANull) scope.fnType.retval = new AVal;
        output = scope.fnType.retval;
      }
      infer(node.argument, scope, c, output);
    },

    ForInStatement: function(node, scope, c) {
      var source = infer(node.right, scope, c);
      if ((node.right.type == "Identifier" && node.right.name in scope.props) ||
          (node.right.type == "MemberExpression" && node.right.property.name == "prototype")) {
        maybeInstantiate(scope, 5);
        var varName;
        if (node.left.type == "Identifier") {
          varName = node.left.name;
        } else if (node.left.type == "VariableDeclaration") {
          varName = node.left.declarations[0].id.name;
        }
        if (varName && varName in scope.props)
          scope.getProp(varName).iteratesOver = source;
      }
      c(node.body, scope, "Statement");
    },

    ScopeBody: function(node, scope, c) { c(node, node.scope || scope); }
  });

  // PARSING

  function runPasses(passes, pass) {
    var arr = passes && passes[pass];
    var args = Array.prototype.slice.call(arguments, 2);
    if (arr) for (var i = 0; i < arr.length; ++i) arr[i].apply(null, args);
  }

  var parse = exports.parse = function(text, passes, options) {
    var ast;
    try { ast = acorn.parse(text, options); }
    catch(e) { ast = acorn_loose.parse_dammit(text, options); }
    runPasses(passes, "postParse", ast, text);
    return ast;
  };

  // ANALYSIS INTERFACE

  exports.analyze = function(ast, name, scope, passes) {
    if (typeof ast == "string") ast = parse(ast);

    if (!name) name = "file#" + cx.origins.length;
    exports.addOrigin(cx.curOrigin = name);

    if (!scope) scope = cx.topScope;
    walk.recursive(ast, scope, null, scopeGatherer);
    runPasses(passes, "preInfer", ast, scope);
    walk.recursive(ast, scope, null, inferWrapper);
    runPasses(passes, "postInfer", ast, scope);

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

  var typeFinder = {
    ArrayExpression: function(node, scope) {
      var eltval = new AVal;
      for (var i = 0; i < node.elements.length; ++i) {
        var elt = node.elements[i];
        if (elt) findType(elt, scope).propagate(eltval);
      }
      return new Arr(eltval);
    },
    ObjectExpression: function(node) {
      return node.objType;
    },
    FunctionExpression: function(node) {
      return node.body.scope.fnType;
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
      var f = findType(node.callee, scope).getFunctionType();
      if (!f) return ANull;
      if (f.computeRet) {
        for (var i = 0, args = []; i < node.arguments.length; ++i)
          args.push(findType(node.arguments[i], scope));
        var self = ANull;
        if (node.callee.type == "MemberExpression")
          self = findType(node.callee.object, scope);
        return f.computeRet(self, args, node.arguments);
      } else {
        return f.retval;
      }
    },
    MemberExpression: function(node, scope) {
      var propN = propName(node, scope), obj = findType(node.object, scope).getType();
      if (obj) return obj.getProp(propN);
      if (propN == "<i>") return ANull;
      return findByPropertyName(propN);
    },
    Identifier: function(node, scope) {
      return scope.hasProp(node.name) || ANull;
    },
    ThisExpression: function(_node, scope) {
      return scope.fnType ? scope.fnType.self : cx.topScope;
    },
    Literal: function(node) {
      return literalType(node);
    }
  };

  function findType(node, scope) {
    return typeFinder[node.type](node, scope);
  }

  var searchVisitor = exports.searchVisitor = walk.make({
    Function: function(node, _st, c) {
      var scope = node.body.scope;
      if (node.id) c(node.id, scope);
      for (var i = 0; i < node.params.length; ++i)
        c(node.params[i], scope);
      c(node.body, scope, "ScopeBody");
    },
    TryStatement: function(node, st, c) {
      if (node.handler)
        c(node.handler.param, st);
      walk.base.TryStatement(node, st, c);
    },
    VariableDeclaration: function(node, st, c) {
      for (var i = 0; i < node.declarations.length; ++i) {
        var decl = node.declarations[i];
        c(decl.id, st);
        if (decl.init) c(decl.init, st, "Expression");
      }
    }
  });
  exports.fullVisitor = walk.make({
    MemberExpression: function(node, st, c) {
      c(node.object, st, "Expression");
      c(node.property, st, node.computed ? "Expression" : null);
    },
    ObjectExpression: function(node, st, c) {
      for (var i = 0; i < node.properties.length; ++i) {
        c(node.properties[i].value, st, "Expression");
        c(node.properties[i].key, st);
      }
    }
  }, searchVisitor);

  exports.findExpressionAt = function(ast, start, end, defaultScope, filter) {
    var test = filter || function(_t, node) {
      if (node.type == "Identifier" && node.name == "✖") return false;
      return typeFinder.hasOwnProperty(node.type);
    };
    return walk.findNodeAt(ast, start, end, test, searchVisitor, defaultScope || cx.topScope);
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

  var findTypeFromContext = {
    ArrayExpression: function(parent, _, get) { return get(parent, true).getProp("<i>"); },
    ObjectExpression: function(parent, node, get) {
      for (var i = 0; i < parent.properties.length; ++i) {
        var prop = node.properties[i];
        if (prop.value == node)
          return get(parent, true).getProp(prop.key.name);
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
    NewExpression: function(parent, node, get) {
      return this.CallExpression(parent, node, get);
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
      var fnNode = walk.findNodeAround(node.sourceFile.ast, node.start, "Function");
      if (fnNode) {
        var fnType = fnNode.node.type == "FunctionExpression"
          ? get(fnNode.node, true).getFunctionType()
          : fnNode.node.body.scope.fnType;
        if (fnType) return fnType.retval.getType();
      }
    },
    VariableDeclaration: function(parent, node, get) {
      for (var i = 0; i < parent.declarations.length; i++) {
        var decl = parent.declarations[i];
        if (decl.init == node) return get(decl.id);
      }
    }
  };

  exports.typeFromContext = function(ast, found) {
    var parent = exports.parentNode(found.node, ast);
    var type = null;
    if (findTypeFromContext.hasOwnProperty(parent.type)) {
      type = findTypeFromContext[parent.type](parent, found.node, function(node, fromContext) {
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

  var refFindWalker = walk.make({}, searchVisitor);

  exports.findRefs = function(ast, baseScope, name, refScope, f) {
    refFindWalker.Identifier = function(node, scope) {
      if (node.name != name) return;
      for (var s = scope; s; s = s.prev) {
        if (s == refScope) f(node, scope);
        if (name in s.props) return;
      }
    };
    walk.recursive(ast, baseScope, null, refFindWalker);
  };

  var simpleWalker = walk.make({
    Function: function(node, _st, c) { c(node.body, node.body.scope, "ScopeBody"); }
  });

  exports.findPropRefs = function(ast, scope, objType, propName, f) {
    walk.simple(ast, {
      MemberExpression: function(node, scope) {
        if (node.computed || node.property.name != propName) return;
        if (findType(node.object, scope).getType() == objType) f(node.property);
      },
      ObjectExpression: function(node, scope) {
        if (findType(node, scope).getType() != objType) return;
        for (var i = 0; i < node.properties.length; ++i)
          if (node.properties[i].key.name == propName) f(node.properties[i].key);
      }
    }, simpleWalker, scope);
  };

  // LOCAL-VARIABLE QUERIES

  var scopeAt = exports.scopeAt = function(ast, pos, defaultScope) {
    var found = walk.findNodeAround(ast, pos, function(tp, node) {
      return tp == "ScopeBody" && node.scope;
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
