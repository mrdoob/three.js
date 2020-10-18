"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WebGPUProperties = /*#__PURE__*/function () {
  function WebGPUProperties() {
    _classCallCheck(this, WebGPUProperties);

    this.properties = new WeakMap();
  }

  _createClass(WebGPUProperties, [{
    key: "get",
    value: function get(object) {
      var map = this.properties.get(object);

      if (map === undefined) {
        map = {};
        this.properties.set(object, map);
      }

      return map;
    }
  }, {
    key: "remove",
    value: function remove(object) {
      this.properties["delete"](object);
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.properties = new WeakMap();
    }
  }]);

  return WebGPUProperties;
}();

var _default = WebGPUProperties;
exports["default"] = _default;