"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.WebGPUSampledCubeTexture = THREE.WebGPUSampled3DTexture = THREE.WebGPUSampledArrayTexture = THREE.WebGPUSampledTexture = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var WebGPUSampledTexture = /*#__PURE__*/function (_WebGPUBinding) {
  _inherits(WebGPUSampledTexture, _WebGPUBinding);

  var _super = _createSuper(WebGPUSampledTexture);

  function WebGPUSampledTexture(name) {
    var _this;

    _classCallCheck(this, WebGPUSampledTexture);

    _this = _super.call(this, name);
    _this.dimension = THREE.GPUTextureViewDimension.TwoD;
    _this.type = THREE.GPUBindingType.SampledTexture;
    _this.visibility = GPUShaderStage.FRAGMENT;
    _this.textureGPU = null;
    Object.defineProperty(_assertThisInitialized(_this), 'isSampledTexture', {
      value: true
    });
    return _this;
  }

  return WebGPUSampledTexture;
}(WebGPUBinding);

THREE.WebGPUSampledTexture = WebGPUSampledTexture;

var WebGPUSampledArrayTexture = /*#__PURE__*/function (_WebGPUSampledTexture) {
  _inherits(WebGPUSampledArrayTexture, _WebGPUSampledTexture);

  var _super2 = _createSuper(WebGPUSampledArrayTexture);

  function WebGPUSampledArrayTexture(name) {
    var _this2;

    _classCallCheck(this, WebGPUSampledArrayTexture);

    _this2 = _super2.call(this, name);
    _this2.dimension = GPUTextureViewDimension.TwoDArray;
    Object.defineProperty(_assertThisInitialized(_this2), 'isSampledArrayTexture', {
      value: true
    });
    return _this2;
  }

  return WebGPUSampledArrayTexture;
}(WebGPUSampledTexture);

THREE.WebGPUSampledArrayTexture = WebGPUSampledArrayTexture;

var WebGPUSampled3DTexture = /*#__PURE__*/function (_WebGPUSampledTexture2) {
  _inherits(WebGPUSampled3DTexture, _WebGPUSampledTexture2);

  var _super3 = _createSuper(WebGPUSampled3DTexture);

  function WebGPUSampled3DTexture(name) {
    var _this3;

    _classCallCheck(this, WebGPUSampled3DTexture);

    _this3 = _super3.call(this, name);
    _this3.dimension = GPUTextureViewDimension.ThreeD;
    Object.defineProperty(_assertThisInitialized(_this3), 'isSampled3DTexture', {
      value: true
    });
    return _this3;
  }

  return WebGPUSampled3DTexture;
}(WebGPUSampledTexture);

THREE.WebGPUSampled3DTexture = WebGPUSampled3DTexture;

var WebGPUSampledCubeTexture = /*#__PURE__*/function (_WebGPUSampledTexture3) {
  _inherits(WebGPUSampledCubeTexture, _WebGPUSampledTexture3);

  var _super4 = _createSuper(WebGPUSampledCubeTexture);

  function WebGPUSampledCubeTexture(name) {
    var _this4;

    _classCallCheck(this, WebGPUSampledCubeTexture);

    _this4 = _super4.call(this, name);
    _this4.dimension = GPUTextureViewDimension.Cube;
    Object.defineProperty(_assertThisInitialized(_this4), 'isSampledCubeTexture', {
      value: true
    });
    return _this4;
  }

  return WebGPUSampledCubeTexture;
}(WebGPUSampledTexture);

THREE.WebGPUSampledCubeTexture = WebGPUSampledCubeTexture;