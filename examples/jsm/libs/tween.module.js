/**
 * The Ease class provides a collection of easing functions for use with tween.js.
 */
var Easing = {
	Linear: {
		None: function (amount) {
			return amount;
		},
	},
	Quadratic: {
		In: function (amount) {
			return amount * amount;
		},
		Out: function (amount) {
			return amount * (2 - amount);
		},
		InOut: function (amount) {
			if ((amount *= 2) < 1) {
				return 0.5 * amount * amount;
			}
			return -0.5 * (--amount * (amount - 2) - 1);
		},
	},
	Cubic: {
		In: function (amount) {
			return amount * amount * amount;
		},
		Out: function (amount) {
			return --amount * amount * amount + 1;
		},
		InOut: function (amount) {
			if ((amount *= 2) < 1) {
				return 0.5 * amount * amount * amount;
			}
			return 0.5 * ((amount -= 2) * amount * amount + 2);
		},
	},
	Quartic: {
		In: function (amount) {
			return amount * amount * amount * amount;
		},
		Out: function (amount) {
			return 1 - --amount * amount * amount * amount;
		},
		InOut: function (amount) {
			if ((amount *= 2) < 1) {
				return 0.5 * amount * amount * amount * amount;
			}
			return -0.5 * ((amount -= 2) * amount * amount * amount - 2);
		},
	},
	Quintic: {
		In: function (amount) {
			return amount * amount * amount * amount * amount;
		},
		Out: function (amount) {
			return --amount * amount * amount * amount * amount + 1;
		},
		InOut: function (amount) {
			if ((amount *= 2) < 1) {
				return 0.5 * amount * amount * amount * amount * amount;
			}
			return 0.5 * ((amount -= 2) * amount * amount * amount * amount + 2);
		},
	},
	Sinusoidal: {
		In: function (amount) {
			return 1 - Math.cos((amount * Math.PI) / 2);
		},
		Out: function (amount) {
			return Math.sin((amount * Math.PI) / 2);
		},
		InOut: function (amount) {
			return 0.5 * (1 - Math.cos(Math.PI * amount));
		},
	},
	Exponential: {
		In: function (amount) {
			return amount === 0 ? 0 : Math.pow(1024, amount - 1);
		},
		Out: function (amount) {
			return amount === 1 ? 1 : 1 - Math.pow(2, -10 * amount);
		},
		InOut: function (amount) {
			if (amount === 0) {
				return 0;
			}
			if (amount === 1) {
				return 1;
			}
			if ((amount *= 2) < 1) {
				return 0.5 * Math.pow(1024, amount - 1);
			}
			return 0.5 * (-Math.pow(2, -10 * (amount - 1)) + 2);
		},
	},
	Circular: {
		In: function (amount) {
			return 1 - Math.sqrt(1 - amount * amount);
		},
		Out: function (amount) {
			return Math.sqrt(1 - --amount * amount);
		},
		InOut: function (amount) {
			if ((amount *= 2) < 1) {
				return -0.5 * (Math.sqrt(1 - amount * amount) - 1);
			}
			return 0.5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1);
		},
	},
	Elastic: {
		In: function (amount) {
			if (amount === 0) {
				return 0;
			}
			if (amount === 1) {
				return 1;
			}
			return -Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
		},
		Out: function (amount) {
			if (amount === 0) {
				return 0;
			}
			if (amount === 1) {
				return 1;
			}
			return Math.pow(2, -10 * amount) * Math.sin((amount - 0.1) * 5 * Math.PI) + 1;
		},
		InOut: function (amount) {
			if (amount === 0) {
				return 0;
			}
			if (amount === 1) {
				return 1;
			}
			amount *= 2;
			if (amount < 1) {
				return -0.5 * Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
			}
			return 0.5 * Math.pow(2, -10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI) + 1;
		},
	},
	Back: {
		In: function (amount) {
			var s = 1.70158;
			return amount * amount * ((s + 1) * amount - s);
		},
		Out: function (amount) {
			var s = 1.70158;
			return --amount * amount * ((s + 1) * amount + s) + 1;
		},
		InOut: function (amount) {
			var s = 1.70158 * 1.525;
			if ((amount *= 2) < 1) {
				return 0.5 * (amount * amount * ((s + 1) * amount - s));
			}
			return 0.5 * ((amount -= 2) * amount * ((s + 1) * amount + s) + 2);
		},
	},
	Bounce: {
		In: function (amount) {
			return 1 - Easing.Bounce.Out(1 - amount);
		},
		Out: function (amount) {
			if (amount < 1 / 2.75) {
				return 7.5625 * amount * amount;
			}
			else if (amount < 2 / 2.75) {
				return 7.5625 * (amount -= 1.5 / 2.75) * amount + 0.75;
			}
			else if (amount < 2.5 / 2.75) {
				return 7.5625 * (amount -= 2.25 / 2.75) * amount + 0.9375;
			}
			else {
				return 7.5625 * (amount -= 2.625 / 2.75) * amount + 0.984375;
			}
		},
		InOut: function (amount) {
			if (amount < 0.5) {
				return Easing.Bounce.In(amount * 2) * 0.5;
			}
			return Easing.Bounce.Out(amount * 2 - 1) * 0.5 + 0.5;
		},
	},
};

var now;
// Include a performance.now polyfill.
// In node.js, use process.hrtime.
// eslint-disable-next-line
// @ts-ignore
if (typeof self === 'undefined' && typeof process !== 'undefined' && process.hrtime) {
	now = function () {
		// eslint-disable-next-line
		// @ts-ignore
		var time = process.hrtime();
		// Convert [seconds, nanoseconds] to milliseconds.
		return time[0] * 1000 + time[1] / 1000000;
	};
}
// In a browser, use self.performance.now if it is available.
else if (typeof self !== 'undefined' && self.performance !== undefined && self.performance.now !== undefined) {
	// This must be bound, because directly assigning this function
	// leads to an invocation exception in Chrome.
	now = self.performance.now.bind(self.performance);
}
// Use Date.now if it is available.
else if (Date.now !== undefined) {
	now = Date.now;
}
// Otherwise, use 'new Date().getTime()'.
else {
	now = function () {
		return new Date().getTime();
	};
}
var now$1 = now;

/**
 * Controlling groups of tweens
 *
 * Using the TWEEN singleton to manage your tweens can cause issues in large apps with many components.
 * In these cases, you may want to create your own smaller groups of tween
 */
var Group = /** @class */ (function () {
	function Group() {
		this._tweens = {};
		this._tweensAddedDuringUpdate = {};
	}
	Group.prototype.getAll = function () {
		var _this = this;
		return Object.keys(this._tweens).map(function (tweenId) {
			return _this._tweens[tweenId];
		});
	};
	Group.prototype.removeAll = function () {
		this._tweens = {};
	};
	Group.prototype.add = function (tween) {
		this._tweens[tween.getId()] = tween;
		this._tweensAddedDuringUpdate[tween.getId()] = tween;
	};
	Group.prototype.remove = function (tween) {
		delete this._tweens[tween.getId()];
		delete this._tweensAddedDuringUpdate[tween.getId()];
	};
	Group.prototype.update = function (time, preserve) {
		if (time === void 0) { time = now$1(); }
		if (preserve === void 0) { preserve = false; }
		var tweenIds = Object.keys(this._tweens);
		if (tweenIds.length === 0) {
			return false;
		}
		// Tweens are updated in "batches". If you add a new tween during an
		// update, then the new tween will be updated in the next batch.
		// If you remove a tween during an update, it may or may not be updated.
		// However, if the removed tween was added during the current batch,
		// then it will not be updated.
		while (tweenIds.length > 0) {
			this._tweensAddedDuringUpdate = {};
			for (var i = 0; i < tweenIds.length; i++) {
				var tween = this._tweens[tweenIds[i]];
				var autoStart = !preserve;
				if (tween && tween.update(time, autoStart) === false && !preserve) {
					delete this._tweens[tweenIds[i]];
				}
			}
			tweenIds = Object.keys(this._tweensAddedDuringUpdate);
		}
		return true;
	};
	return Group;
}());

/**
 *
 */
var Interpolation = {
	Linear: function (v, k) {
		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = Interpolation.Utils.Linear;
		if (k < 0) {
			return fn(v[0], v[1], f);
		}
		if (k > 1) {
			return fn(v[m], v[m - 1], m - f);
		}
		return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
	},
	Bezier: function (v, k) {
		var b = 0;
		var n = v.length - 1;
		var pw = Math.pow;
		var bn = Interpolation.Utils.Bernstein;
		for (var i = 0; i <= n; i++) {
			b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
		}
		return b;
	},
	CatmullRom: function (v, k) {
		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = Interpolation.Utils.CatmullRom;
		if (v[0] === v[m]) {
			if (k < 0) {
				i = Math.floor((f = m * (1 + k)));
			}
			return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
		}
		else {
			if (k < 0) {
				return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
			}
			if (k > 1) {
				return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
			}
			return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
		}
	},
	Utils: {
		Linear: function (p0, p1, t) {
			return (p1 - p0) * t + p0;
		},
		Bernstein: function (n, i) {
			var fc = Interpolation.Utils.Factorial;
			return fc(n) / fc(i) / fc(n - i);
		},
		Factorial: (function () {
			var a = [1];
			return function (n) {
				var s = 1;
				if (a[n]) {
					return a[n];
				}
				for (var i = n; i > 1; i--) {
					s *= i;
				}
				a[n] = s;
				return s;
			};
		})(),
		CatmullRom: function (p0, p1, p2, p3, t) {
			var v0 = (p2 - p0) * 0.5;
			var v1 = (p3 - p1) * 0.5;
			var t2 = t * t;
			var t3 = t * t2;
			return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
		},
	},
};

/**
 * Utils
 */
var Sequence = /** @class */ (function () {
	function Sequence() {
	}
	Sequence.nextId = function () {
		return Sequence._nextId++;
	};
	Sequence._nextId = 0;
	return Sequence;
}());

var mainGroup = new Group();

/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */
var Tween = /** @class */ (function () {
	function Tween(_object, _group) {
		if (_group === void 0) { _group = mainGroup; }
		this._object = _object;
		this._group = _group;
		this._isPaused = false;
		this._pauseStart = 0;
		this._valuesStart = {};
		this._valuesEnd = {};
		this._valuesStartRepeat = {};
		this._duration = 1000;
		this._initialRepeat = 0;
		this._repeat = 0;
		this._yoyo = false;
		this._isPlaying = false;
		this._reversed = false;
		this._delayTime = 0;
		this._startTime = 0;
		this._easingFunction = Easing.Linear.None;
		this._interpolationFunction = Interpolation.Linear;
		this._chainedTweens = [];
		this._onStartCallbackFired = false;
		this._id = Sequence.nextId();
		this._isChainStopped = false;
		this._goToEnd = false;
	}
	Tween.prototype.getId = function () {
		return this._id;
	};
	Tween.prototype.isPlaying = function () {
		return this._isPlaying;
	};
	Tween.prototype.isPaused = function () {
		return this._isPaused;
	};
	Tween.prototype.to = function (properties, duration) {
		// TODO? restore this, then update the 07_dynamic_to example to set fox
		// tween's to on each update. That way the behavior is opt-in (there's
		// currently no opt-out).
		// for (const prop in properties) this._valuesEnd[prop] = properties[prop]
		this._valuesEnd = Object.create(properties);
		if (duration !== undefined) {
			this._duration = duration;
		}
		return this;
	};
	Tween.prototype.duration = function (d) {
		this._duration = d;
		return this;
	};
	Tween.prototype.start = function (time) {
		if (this._isPlaying) {
			return this;
		}
		// eslint-disable-next-line
		this._group && this._group.add(this);
		this._repeat = this._initialRepeat;
		if (this._reversed) {
			// If we were reversed (f.e. using the yoyo feature) then we need to
			// flip the tween direction back to forward.
			this._reversed = false;
			for (var property in this._valuesStartRepeat) {
				this._swapEndStartRepeatValues(property);
				this._valuesStart[property] = this._valuesStartRepeat[property];
			}
		}
		this._isPlaying = true;
		this._isPaused = false;
		this._onStartCallbackFired = false;
		this._isChainStopped = false;
		this._startTime = time !== undefined ? (typeof time === 'string' ? now$1() + parseFloat(time) : time) : now$1();
		this._startTime += this._delayTime;
		this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat);
		return this;
	};
	Tween.prototype._setupProperties = function (_object, _valuesStart, _valuesEnd, _valuesStartRepeat) {
		for (var property in _valuesEnd) {
			var startValue = _object[property];
			var startValueIsArray = Array.isArray(startValue);
			var propType = startValueIsArray ? 'array' : typeof startValue;
			var isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property]);
			// If `to()` specifies a property that doesn't exist in the source object,
			// we should not set that property in the object
			if (propType === 'undefined' || propType === 'function') {
				continue;
			}
			// Check if an Array was provided as property value
			if (isInterpolationList) {
				var endValues = _valuesEnd[property];
				if (endValues.length === 0) {
					continue;
				}
				// handle an array of relative values
				endValues = endValues.map(this._handleRelativeValue.bind(this, startValue));
				// Create a local copy of the Array with the start value at the front
				_valuesEnd[property] = [startValue].concat(endValues);
			}
			// handle the deepness of the values
			if ((propType === 'object' || startValueIsArray) && startValue && !isInterpolationList) {
				_valuesStart[property] = startValueIsArray ? [] : {};
				// eslint-disable-next-line
				for (var prop in startValue) {
					// eslint-disable-next-line
					// @ts-ignore FIXME?
					_valuesStart[property][prop] = startValue[prop];
				}
				_valuesStartRepeat[property] = startValueIsArray ? [] : {}; // TODO? repeat nested values? And yoyo? And array values?
				// eslint-disable-next-line
				// @ts-ignore FIXME?
				this._setupProperties(startValue, _valuesStart[property], _valuesEnd[property], _valuesStartRepeat[property]);
			}
			else {
				// Save the starting value, but only once.
				if (typeof _valuesStart[property] === 'undefined') {
					_valuesStart[property] = startValue;
				}
				if (!startValueIsArray) {
					// eslint-disable-next-line
					// @ts-ignore FIXME?
					_valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
				}
				if (isInterpolationList) {
					// eslint-disable-next-line
					// @ts-ignore FIXME?
					_valuesStartRepeat[property] = _valuesEnd[property].slice().reverse();
				}
				else {
					_valuesStartRepeat[property] = _valuesStart[property] || 0;
				}
			}
		}
	};
	Tween.prototype.stop = function () {
		if (!this._isChainStopped) {
			this._isChainStopped = true;
			this.stopChainedTweens();
		}
		if (!this._isPlaying) {
			return this;
		}
		// eslint-disable-next-line
		this._group && this._group.remove(this);
		this._isPlaying = false;
		this._isPaused = false;
		if (this._onStopCallback) {
			this._onStopCallback(this._object);
		}
		return this;
	};
	Tween.prototype.end = function () {
		this._goToEnd = true;
		this.update(Infinity);
		return this;
	};
	Tween.prototype.pause = function (time) {
		if (time === void 0) { time = now$1(); }
		if (this._isPaused || !this._isPlaying) {
			return this;
		}
		this._isPaused = true;
		this._pauseStart = time;
		// eslint-disable-next-line
		this._group && this._group.remove(this);
		return this;
	};
	Tween.prototype.resume = function (time) {
		if (time === void 0) { time = now$1(); }
		if (!this._isPaused || !this._isPlaying) {
			return this;
		}
		this._isPaused = false;
		this._startTime += time - this._pauseStart;
		this._pauseStart = 0;
		// eslint-disable-next-line
		this._group && this._group.add(this);
		return this;
	};
	Tween.prototype.stopChainedTweens = function () {
		for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
			this._chainedTweens[i].stop();
		}
		return this;
	};
	Tween.prototype.group = function (group) {
		this._group = group;
		return this;
	};
	Tween.prototype.delay = function (amount) {
		this._delayTime = amount;
		return this;
	};
	Tween.prototype.repeat = function (times) {
		this._initialRepeat = times;
		this._repeat = times;
		return this;
	};
	Tween.prototype.repeatDelay = function (amount) {
		this._repeatDelayTime = amount;
		return this;
	};
	Tween.prototype.yoyo = function (yoyo) {
		this._yoyo = yoyo;
		return this;
	};
	Tween.prototype.easing = function (easingFunction) {
		this._easingFunction = easingFunction;
		return this;
	};
	Tween.prototype.interpolation = function (interpolationFunction) {
		this._interpolationFunction = interpolationFunction;
		return this;
	};
	Tween.prototype.chain = function () {
		var tweens = [];
		for (var _i = 0; _i < arguments.length; _i++) {
			tweens[_i] = arguments[_i];
		}
		this._chainedTweens = tweens;
		return this;
	};
	Tween.prototype.onStart = function (callback) {
		this._onStartCallback = callback;
		return this;
	};
	Tween.prototype.onUpdate = function (callback) {
		this._onUpdateCallback = callback;
		return this;
	};
	Tween.prototype.onRepeat = function (callback) {
		this._onRepeatCallback = callback;
		return this;
	};
	Tween.prototype.onComplete = function (callback) {
		this._onCompleteCallback = callback;
		return this;
	};
	Tween.prototype.onStop = function (callback) {
		this._onStopCallback = callback;
		return this;
	};
	/**
	 * @returns true if the tween is still playing after the update, false
	 * otherwise (calling update on a paused tween still returns true because
	 * it is still playing, just paused).
	 */
	Tween.prototype.update = function (time, autoStart) {
		if (time === void 0) { time = now$1(); }
		if (autoStart === void 0) { autoStart = true; }
		if (this._isPaused)
			return true;
		var property;
		var elapsed;
		var endTime = this._startTime + this._duration;
		if (!this._goToEnd && !this._isPlaying) {
			if (time > endTime)
				return false;
			if (autoStart)
				this.start(time);
		}
		this._goToEnd = false;
		if (time < this._startTime) {
			return true;
		}
		if (this._onStartCallbackFired === false) {
			if (this._onStartCallback) {
				this._onStartCallback(this._object);
			}
			this._onStartCallbackFired = true;
		}
		elapsed = (time - this._startTime) / this._duration;
		elapsed = this._duration === 0 || elapsed > 1 ? 1 : elapsed;
		var value = this._easingFunction(elapsed);
		// properties transformations
		this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value);
		if (this._onUpdateCallback) {
			this._onUpdateCallback(this._object, elapsed);
		}
		if (elapsed === 1) {
			if (this._repeat > 0) {
				if (isFinite(this._repeat)) {
					this._repeat--;
				}
				// Reassign starting values, restart by making startTime = now
				for (property in this._valuesStartRepeat) {
					if (!this._yoyo && typeof this._valuesEnd[property] === 'string') {
						this._valuesStartRepeat[property] =
							// eslint-disable-next-line
							// @ts-ignore FIXME?
							this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
					}
					if (this._yoyo) {
						this._swapEndStartRepeatValues(property);
					}
					this._valuesStart[property] = this._valuesStartRepeat[property];
				}
				if (this._yoyo) {
					this._reversed = !this._reversed;
				}
				if (this._repeatDelayTime !== undefined) {
					this._startTime = time + this._repeatDelayTime;
				}
				else {
					this._startTime = time + this._delayTime;
				}
				if (this._onRepeatCallback) {
					this._onRepeatCallback(this._object);
				}
				return true;
			}
			else {
				if (this._onCompleteCallback) {
					this._onCompleteCallback(this._object);
				}
				for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
					// Make the chained tweens start exactly at the time they should,
					// even if the `update()` method was called way past the duration of the tween
					this._chainedTweens[i].start(this._startTime + this._duration);
				}
				this._isPlaying = false;
				return false;
			}
		}
		return true;
	};
	Tween.prototype._updateProperties = function (_object, _valuesStart, _valuesEnd, value) {
		for (var property in _valuesEnd) {
			// Don't update properties that do not exist in the source object
			if (_valuesStart[property] === undefined) {
				continue;
			}
			var start = _valuesStart[property] || 0;
			var end = _valuesEnd[property];
			var startIsArray = Array.isArray(_object[property]);
			var endIsArray = Array.isArray(end);
			var isInterpolationList = !startIsArray && endIsArray;
			if (isInterpolationList) {
				_object[property] = this._interpolationFunction(end, value);
			}
			else if (typeof end === 'object' && end) {
				// eslint-disable-next-line
				// @ts-ignore FIXME?
				this._updateProperties(_object[property], start, end, value);
			}
			else {
				// Parses relative end values with start as base (e.g.: +10, -3)
				end = this._handleRelativeValue(start, end);
				// Protect against non numeric properties.
				if (typeof end === 'number') {
					// eslint-disable-next-line
					// @ts-ignore FIXME?
					_object[property] = start + (end - start) * value;
				}
			}
		}
	};
	Tween.prototype._handleRelativeValue = function (start, end) {
		if (typeof end !== 'string') {
			return end;
		}
		if (end.charAt(0) === '+' || end.charAt(0) === '-') {
			return start + parseFloat(end);
		}
		else {
			return parseFloat(end);
		}
	};
	Tween.prototype._swapEndStartRepeatValues = function (property) {
		var tmp = this._valuesStartRepeat[property];
		var endValue = this._valuesEnd[property];
		if (typeof endValue === 'string') {
			this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(endValue);
		}
		else {
			this._valuesStartRepeat[property] = this._valuesEnd[property];
		}
		this._valuesEnd[property] = tmp;
	};
	return Tween;
}());

var VERSION = '18.6.4';

/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */
var nextId = Sequence.nextId;
/**
 * Controlling groups of tweens
 *
 * Using the TWEEN singleton to manage your tweens can cause issues in large apps with many components.
 * In these cases, you may want to create your own smaller groups of tweens.
 */
var TWEEN = mainGroup;
// This is the best way to export things in a way that's compatible with both ES
// Modules and CommonJS, without build hacks, and so as not to break the
// existing API.
// https://github.com/rollup/rollup/issues/1961#issuecomment-423037881
var getAll = TWEEN.getAll.bind(TWEEN);
var removeAll = TWEEN.removeAll.bind(TWEEN);
var add = TWEEN.add.bind(TWEEN);
var remove = TWEEN.remove.bind(TWEEN);
var update = TWEEN.update.bind(TWEEN);
var exports = {
	Easing: Easing,
	Group: Group,
	Interpolation: Interpolation,
	now: now$1,
	Sequence: Sequence,
	nextId: nextId,
	Tween: Tween,
	VERSION: VERSION,
	getAll: getAll,
	removeAll: removeAll,
	add: add,
	remove: remove,
	update: update,
};

export default exports;
export { Easing, Group, Interpolation, Sequence, Tween, VERSION, add, getAll, nextId, now$1 as now, remove, removeAll, update };
