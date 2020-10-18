"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.Matrix4Uniform = THREE.Matrix3Uniform = THREE.ColorUniform = THREE.Vector4Uniform = THREE.Vector3Uniform = THREE.Vector2Uniform = THREE.FloatUniform = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WebGPUUniform = /*#__PURE__*/function () {
  function WebGPUUniform(name) {
    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, WebGPUUniform);

    this.name = name;
    this.value = value;
    this.boundary = 0;
    this.itemSize = 0;
    this.offset = 0;
  }

  _createClass(WebGPUUniform, [{
    key: "setValue",
    value: function setValue(value) {
      this.value = value;
    }
  }]);

  return WebGPUUniform;
}();

var FloatUniform = /*#__PURE__*/function (_WebGPUUniform) {
  _inherits(FloatUniform, _WebGPUUniform);

  var _super = _createSuper(FloatUniform);

  function FloatUniform(name) {
    var _this;

    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, FloatUniform);

    _this = _super.call(this, name, value);
    _this.boundary = 4;
    _this.itemSize = 1;
    Object.defineProperty(_assertThisInitialized(_this), 'isFloatUniform', {
      value: true
    });
    return _this;
  }

  return FloatUniform;
}(WebGPUUniform);

THREE.FloatUniform = FloatUniform;

var Vector2Uniform = /*#__PURE__*/function (_WebGPUUniform2) {
  _inherits(Vector2Uniform, _WebGPUUniform2);

  var _super2 = _createSuper(Vector2Uniform);

  function Vector2Uniform(name) {
    var _this2;

    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector2();

    _classCallCheck(this, Vector2Uniform);

    _this2 = _super2.call(this, name, value);
    _this2.boundary = 8;
    _this2.itemSize = 2;
    Object.defineProperty(_assertThisInitialized(_this2), 'isVector2Uniform', {
      value: true
    });
    return _this2;
  }

  return Vector2Uniform;
}(WebGPUUniform);

THREE.Vector2Uniform = Vector2Uniform;

var Vector3Uniform = /*#__PURE__*/function (_WebGPUUniform3) {
  _inherits(Vector3Uniform, _WebGPUUniform3);

  var _super3 = _createSuper(Vector3Uniform);

  function Vector3Uniform(name) {
    var _this3;

    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector3();

    _classCallCheck(this, Vector3Uniform);

    _this3 = _super3.call(this, name, value);
    _this3.boundary = 16;
    _this3.itemSize = 3;
    Object.defineProperty(_assertThisInitialized(_this3), 'isVector3Uniform', {
      value: true
    });
    return _this3;
  }

  return Vector3Uniform;
}(WebGPUUniform);

THREE.Vector3Uniform = Vector3Uniform;

var Vector4Uniform = /*#__PURE__*/function (_WebGPUUniform4) {
  _inherits(Vector4Uniform, _WebGPUUniform4);

  var _super4 = _createSuper(Vector4Uniform);

  function Vector4Uniform(name) {
    var _this4;

    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector4();

    _classCallCheck(this, Vector4Uniform);

    _this4 = _super4.call(this, name, value);
    _this4.boundary = 16;
    _this4.itemSize = 4;
    Object.defineProperty(_assertThisInitialized(_this4), 'isVector4Uniform', {
      value: true
    });
    return _this4;
  }

  return Vector4Uniform;
}(WebGPUUniform);

THREE.Vector4Uniform = Vector4Uniform;

var ColorUniform = /*#__PURE__*/function (_WebGPUUniform5) {
  _inherits(ColorUniform, _WebGPUUniform5);

  var _super5 = _createSuper(ColorUniform);

  function ColorUniform(name) {
    var _this5;

    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Color();

    _classCallCheck(this, ColorUniform);

    _this5 = _super5.call(this, name, value);
    _this5.boundary = 16;
    _this5.itemSize = 3;
    Object.defineProperty(_assertThisInitialized(_this5), 'isColorUniform', {
      value: true
    });
    return _this5;
  }

  return ColorUniform;
}(WebGPUUniform);

THREE.ColorUniform = ColorUniform;

var Matrix3Uniform = /*#__PURE__*/function (_WebGPUUniform6) {
  _inherits(Matrix3Uniform, _WebGPUUniform6);

  var _super6 = _createSuper(Matrix3Uniform);

  function Matrix3Uniform(name) {
    var _this6;

    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Matrix3();

    _classCallCheck(this, Matrix3Uniform);

    _this6 = _super6.call(this, name, value);
    _this6.boundary = 48;
    _this6.itemSize = 12;
    Object.defineProperty(_assertThisInitialized(_this6), 'isMatrix3Uniform', {
      value: true
    });
    return _this6;
  }

  return Matrix3Uniform;
}(WebGPUUniform);

THREE.Matrix3Uniform = Matrix3Uniform;

var Matrix4Uniform = /*#__PURE__*/function (_WebGPUUniform7) {
  _inherits(Matrix4Uniform, _WebGPUUniform7);

  var _super7 = _createSuper(Matrix4Uniform);

  function Matrix4Uniform(name) {
    var _this7;

    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Matrix4();

    _classCallCheck(this, Matrix4Uniform);

    _this7 = _super7.call(this, name, value);
    _this7.boundary = 64;
    _this7.itemSize = 16;
    Object.defineProperty(_assertThisInitialized(_this7), 'isMatrix4Uniform', {
      value: true
    });
    return _this7;
  }

  return Matrix4Uniform;
}(WebGPUUniform);

THREE.Matrix4Uniform = Matrix4Uniform;