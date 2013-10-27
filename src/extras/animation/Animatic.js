/**
 * @author David Griffiths https://github.com/dogriffiths
 */

THREE.Animatic = function() {
}

THREE.Animatic.Objects = [];
THREE.Animatic.Attributes = [];
THREE.Animatic.Easing = {
  linear: function(prop, v1, v2) {return v1 + (prop * (v2 - v1));},
  ease: function(prop, v1, v2) {return v1 + (Math.sin(prop * Math.PI / 2) * (v2 - v1));},
  spring: function(prop, v1, v2) {
        var t = prop;
        var b = v1;
        var c = v2 - v1;
	var ts = t * t;
	var tc = ts * t;
        var snap = (56*tc*ts + -175*ts*ts + 200*tc + -100*ts + 20*t);
        return b + c * snap;
  },
  bounce: function(prop, v1, v2) {
        var t = prop;
        var b = v1;
        var c = v2 - v1;
	var ts = t * t;
	var tc = ts * t;
        var snap = (56*tc*ts + -175*ts*ts + 200*tc + -100*ts + 20*t);
        if (snap > 1) {
          snap = 2 - snap;
        }
        return b + c * snap;
  },
  snap: function(prop, v1, v2) {
        var t = prop;
        var b = v1;
        var c = v2 - v1;
	var ts = t * t;
	var tc = ts * t;
	var snap = (tc*ts + -5*ts*ts + 10*tc + -10*ts + 5*t);
	return b+c*snap;
  }
};

//
// These are the major functions.
//

THREE.Animatic.stopAllAnimation = function() {
    THREE.Animatic.Objects = [];
    THREE.Animatic.Attributes = [];
}

THREE.Animatic.Sequencer = function() {
}

THREE.Animatic.animate = function(obj, binding, howManySecs, doAfter) {
  return THREE.Animatic.animateWith(obj, binding, howManySecs, doAfter, THREE.Animatic.Easing.linear);
}

THREE.Animatic.ease = function(obj, binding, howManySecs, doAfter) {
  return THREE.Animatic.animateWith(obj, binding, howManySecs, doAfter, THREE.Animatic.Easing.ease);
}

THREE.Animatic.spring = function(obj, binding, howManySecs, doAfter) {
  return THREE.Animatic.animateWith(obj, binding, howManySecs, doAfter, THREE.Animatic.Easing.spring);
}

THREE.Animatic.bounce = function(obj, binding, howManySecs, doAfter) {
  return THREE.Animatic.animateWith(obj, binding, howManySecs, doAfter, THREE.Animatic.Easing.bounce);
}

THREE.Animatic.snap = function(obj, binding, howManySecs, doAfter) {
  return THREE.Animatic.animateWith(obj, binding, howManySecs, doAfter, THREE.Animatic.Easing.snap);
}

THREE.Animatic.animateWith = function(obj, binding, howManySecs, doAfter, easing) {
  var b, result, attrName;
  if ((Object.prototype.toString.call(binding) === '[object Array]') && (binding.length > 0)) {
    result = THREE.Animatic.animateWith(obj, binding[0], howManySecs / binding.length, undefined, easing);
    if (binding.length > 1) {
      result.next = function() {
        THREE.Animatic.animateWith(obj, binding.slice(1, binding.length), 
          howManySecs * (binding.length - 1) / binding.length, doAfter, easing);
      }
    } else if (doAfter) {
      result.next = doAfter;
    }
  } else {
    for (attrName in binding) {
      b = binding[attrName];
      if (typeof b == "number") {
        result = THREE.Animatic.animateSingle(obj, attrName, b, howManySecs, easing);
      } else if ((Object.prototype.toString.call(b) === '[object Array]') && (b.length > 0)) {
        THREE.Animatic.animateWith(obj[attrName], b, howManySecs, undefined, easing);
        result = THREE.Animatic.animateSingle(obj, "__$$$dummy", 1, howManySecs, easing);
      } else if (typeof b == "object") {
        result = THREE.Animatic.animateWith(obj[attrName], b, howManySecs, undefined, easing);
      }
    }
    if (doAfter) {
      result.next = doAfter;
    }
  }
  return result;
}

THREE.Animatic.animateSingle = function (obj, attrName, targetValue, howManySecs, easing) {
    var animatorFn;
    var t = howManySecs || 0.25;
    var seq = new THREE.Animatic.Sequencer();
    animatorFn = THREE.Animatic.runner(t, obj[attrName], targetValue, obj, attrName, seq, easing);
    THREE.Animatic.animateWithAnimator(obj, attrName, animatorFn);
    return seq;
}

/**
 * Stop the animation for a given object/attribute. If the attribute-name
 * is not given, THREE.Animatic method will stop the animation of all attributes on
 * the object.
 *
 *   stopAnimation(<object>, [<attribute-name>])
 */
THREE.Animatic.stopAnimation = function(obj, attrNameValue)
{
    var attrName = attrNameValue || "";
    for (var i = THREE.Animatic.Objects.length - 1; i >= 0; i--) {
        var o = THREE.Animatic.Objects[i];
        var a = THREE.Animatic.Attributes[i];
        if ((o == obj) && ((a == attrName) || (attrName = ""))) {
            THREE.Animatic.Objects.splice(i, 1);
            THREE.Animatic.Attributes.splice(i, 1);
        }
    }
}

//
// And these are the rest
//

THREE.Animatic.animateWithAnimator = function(obj, attrName, animatorFn) {
    obj["animatic_" + attrName] = animatorFn;
    for (var i = THREE.Animatic.Objects.length - 1; i >= 0; i--) {
        var o = THREE.Animatic.Objects[i];
        var a = THREE.Animatic.Attributes[i];
        if ((o == obj) && (a == attrName)) {
            THREE.Animatic.Objects.splice(i, 1);
            THREE.Animatic.Attributes.splice(i, 1);
        }
    }
    THREE.Animatic.Objects.push(obj);
    THREE.Animatic.Attributes.push(attrName);
}

// Now repaint every 10 ms.
setInterval(function() {
    THREE.Animatic.updateAll()
}, 10);

THREE.Animatic.updateAll = function() {
    var i;
    for (i in THREE.Animatic.Objects) {
        var obj = THREE.Animatic.Objects[i];
        var attrName = THREE.Animatic.Attributes[i];
        var units = THREE.Animatic.unitsFor(obj[attrName]);
        var newValue = obj["animatic_" + attrName]();
        newValue = Math.round(newValue * 1000) / 1000;
        if (attrName.match("^_item_")  == "_item_") {
            var origObject = obj["_object"];
            var origAttr = obj["_attr"];
            var origIndex = eval(attrName.substring(6));
            origObject[origAttr][eval(origIndex)] = THREE.Animatic.addUnitsTo("" + newValue, units);
        } else {
            obj[attrName] = THREE.Animatic.addUnitsTo("" + newValue, units);
        }
    }
}

THREE.Animatic.stripUnits = function(s) {
    return ("" + s).replace( /[a-z%]/ig, "");
}

THREE.Animatic.unitsFor = function(s) {
    return ("" + s).replace( /[0-9.-]+/ig, "?");
}

THREE.Animatic.addUnitsTo = function(s, u) {
    if (u == "?") {
        return eval(s);
    }
    if (u.match(/\?.+\?/)) {
        throw "Animatic cannot animate an attribute with multiple parameters: '" + u + "'";
    }
    return u.replace( /\?/ig, "" + s);
}

THREE.Animatic.now = function() {
    return (new Date()).valueOf();
}

//
// The animator factories
//

THREE.Animatic.runner = function(p, fromValue, toValue, obj, attrName, seq, easing) {
    var v1 = eval(THREE.Animatic.stripUnits(fromValue + ""));
    var v2 = eval(THREE.Animatic.stripUnits(toValue + ""));
    var now = THREE.Animatic.now();
    var then = now + (p * 1000);
    var seqRun = false;
    return function() {
        var justNow = THREE.Animatic.now();
        if (justNow >= then) {
            THREE.Animatic.stopAnimation(obj, attrName);
            if (!seqRun) {
                seqRun = true;
                if (seq.next) {
                    seq.next();
                }
            }
            return v2;
        }
        var prop = (justNow - now) / (then - now);
        return easing(prop, v1, v2);
    }
}
