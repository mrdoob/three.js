"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WebGPU = /*#__PURE__*/function () {
  function WebGPU() {
    _classCallCheck(this, WebGPU);
  }

  _createClass(WebGPU, null, [{
    key: "isAvailable",
    value: function isAvailable() {
      return navigator.gpu !== undefined;
    }
  }, {
    key: "getErrorMessage",
    value: function getErrorMessage() {
      var message = 'Your browser does not support <a href="https://gpuweb.github.io/gpuweb/" style="color:#000">WebGPU</a>.';
      var element = document.createElement('div');
      element.id = 'webgpumessage';
      element.style.fontFamily = 'monospace';
      element.style.fontSize = '13px';
      element.style.fontWeight = 'normal';
      element.style.textAlign = 'center';
      element.style.background = '#fff';
      element.style.color = '#000';
      element.style.padding = '1.5em';
      element.style.width = '400px';
      element.style.margin = '5em auto 0';
      element.innerHTML = message;
      return element;
    }
  }]);

  return WebGPU;
}();

var _default = WebGPU;
exports["default"] = _default;