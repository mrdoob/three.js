"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var WebGPUUniformsGroup = /*#__PURE__*/function (_WebGPUBinding) {
  _inherits(WebGPUUniformsGroup, _WebGPUBinding);

  var _super = _createSuper(WebGPUUniformsGroup);

  function WebGPUUniformsGroup(name) {
    var _this;

    _classCallCheck(this, WebGPUUniformsGroup);

    _this = _super.call(this, name);
    _this.uniforms = [];

    _this.onBeforeUpdate = function () {};

    _this.bytesPerElement = Float32Array.BYTES_PER_ELEMENT;
    _this.type = THREE.GPUBindingType.UniformBuffer;
    _this.visibility = GPUShaderStage.VERTEX;
    _this.usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
    _this.array = null;
    _this.bufferGPU = null;
    Object.defineProperty(_assertThisInitialized(_this), 'isUniformsGroup', {
      value: true
    });
    return _this;
  }

  _createClass(WebGPUUniformsGroup, [{
    key: "addUniform",
    value: function addUniform(uniform) {
      this.uniforms.push(uniform);
      return this;
    }
  }, {
    key: "removeUniform",
    value: function removeUniform(uniform) {
      var index = this.uniforms.indexOf(uniform);

      if (index !== -1) {
        this.uniforms.splice(index, 1);
      }

      return this;
    }
  }, {
    key: "setOnBeforeUpdate",
    value: function setOnBeforeUpdate(callback) {
      this.onBeforeUpdate = callback;
      return this;
    }
  }, {
    key: "getByteLength",
    value: function getByteLength() {
      var offset = 0;
      var chunkSize = 16;

      for (var i = 0, l = this.uniforms.length; i < l; i++) {
        var uniform = this.uniforms[i];
        var chunkOffset = offset % chunkSize;
        var remainingSizeInChunk = chunkSize - chunkOffset;

        if (chunkOffset !== 0 && remainingSizeInChunk - uniform.boundary < 0) {
          offset += chunkSize - chunkOffset;
        }

        uniform.offset = offset / this.bytesPerElement;
        offset += uniform.itemSize * this.bytesPerElement;
      }

      return offset;
    }
  }, {
    key: "update",
    value: function update() {
      var updated = false;

      var _iterator = _createForOfIteratorHelper(this.uniforms),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var uniform = _step.value;

          if (this.updateByType(uniform) === true) {
            updated = true;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return updated;
    }
  }, {
    key: "updateByType",
    value: function updateByType(uniform) {
      if (uniform.isFloatUniform) return this.updateNumber(uniform);
      if (uniform.isVector2Uniform) return this.updateVector2(uniform);
      if (uniform.isVector3Uniform) return this.updateVector3(uniform);
      if (uniform.isVector4Uniform) return this.updateVector4(uniform);
      if (uniform.isColorUniform) return this.updateColor(uniform);
      if (uniform.isMatrix3Uniform) return this.updateMatrix3(uniform);
      if (uniform.isMatrix4Uniform) return this.updateMatrix4(uniform);
      console.error('THREE.WebGPUUniformsGroup: Unsupported uniform type.', uniform);
    }
  }, {
    key: "updateNumber",
    value: function updateNumber(uniform) {
      var updated = false;
      var a = this.array;
      var v = uniform.value;
      var offset = uniform.offset;

      if (a[offset] !== v) {
        a[offset] = v;
        updated = true;
      }

      return updated;
    }
  }, {
    key: "updateVector2",
    value: function updateVector2(uniform) {
      var updated = false;
      var a = this.array;
      var v = uniform.value;
      var offset = uniform.offset;

      if (a[offset + 0] !== v.x || a[offset + 1] !== v.y) {
        a[offset + 0] = v.x;
        a[offset + 1] = v.y;
        updated = true;
      }

      return updated;
    }
  }, {
    key: "updateVector3",
    value: function updateVector3(uniform) {
      var updated = false;
      var a = this.array;
      var v = uniform.value;
      var offset = uniform.offset;

      if (a[offset + 0] !== v.x || a[offset + 1] !== v.y || a[offset + 2] !== v.z) {
        a[offset + 0] = v.x;
        a[offset + 1] = v.y;
        a[offset + 2] = v.z;
        updated = true;
      }

      return updated;
    }
  }, {
    key: "updateVector4",
    value: function updateVector4(uniform) {
      var updated = false;
      var a = this.array;
      var v = uniform.value;
      var offset = uniform.offset;

      if (a[offset + 0] !== v.x || a[offset + 1] !== v.y || a[offset + 2] !== v.z || a[offset + 4] !== v.w) {
        a[offset + 0] = v.x;
        a[offset + 1] = v.y;
        a[offset + 2] = v.z;
        a[offset + 3] = v.z;
        updated = true;
      }

      return updated;
    }
  }, {
    key: "updateColor",
    value: function updateColor(uniform) {
      var updated = false;
      var a = this.array;
      var c = uniform.value;
      var offset = uniform.offset;

      if (a[offset + 0] !== c.r || a[offset + 1] !== c.g || a[offset + 2] !== c.b) {
        a[offset + 0] = c.r;
        a[offset + 1] = c.g;
        a[offset + 2] = c.b;
        updated = true;
      }

      return updated;
    }
  }, {
    key: "updateMatrix3",
    value: function updateMatrix3(uniform) {
      var updated = false;
      var a = this.array;
      var e = uniform.value.elements;
      var offset = uniform.offset;

      if (a[offset + 0] !== e[0] || a[offset + 1] !== e[1] || a[offset + 2] !== e[2] || a[offset + 4] !== e[3] || a[offset + 5] !== e[4] || a[offset + 6] !== e[5] || a[offset + 8] !== e[6] || a[offset + 9] !== e[7] || a[offset + 10] !== e[8]) {
        a[offset + 0] = e[0];
        a[offset + 1] = e[1];
        a[offset + 2] = e[2];
        a[offset + 4] = e[3];
        a[offset + 5] = e[4];
        a[offset + 6] = e[5];
        a[offset + 8] = e[6];
        a[offset + 9] = e[7];
        a[offset + 10] = e[8];
        updated = true;
      }

      return updated;
    }
  }, {
    key: "updateMatrix4",
    value: function updateMatrix4(uniform) {
      var updated = false;
      var a = this.array;
      var e = uniform.value.elements;
      var offset = uniform.offset;

      if (arraysEqual(a, e, offset) === false) {
        a.set(e, offset);
        updated = true;
      }

      return updated;
    }
  }]);

  return WebGPUUniformsGroup;
}(WebGPUBinding);

function arraysEqual(a, b, offset) {
  for (var i = 0, l = b.length; i < l; i++) {
    if (a[offset + i] !== b[i]) return false;
  }

  return true;
}

var _default = WebGPUUniformsGroup;
exports["default"] = _default;