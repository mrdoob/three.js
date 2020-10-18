"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WebGPUBinding = /*#__PURE__*/function () {
  function WebGPUBinding() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    _classCallCheck(this, WebGPUBinding);

    this.name = name;
    this.visibility = null;
    this.type = null;
  }

  _createClass(WebGPUBinding, [{
    key: "setVisibility",
    value: function setVisibility(visibility) {
      this.visibility = visibility;
    }
  }]);

  return WebGPUBinding;
}();

var _default = WebGPUBinding;
exports["default"] = _default;