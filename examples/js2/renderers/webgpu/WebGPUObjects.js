"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WebGPUObjects = /*#__PURE__*/function () {
  function WebGPUObjects(geometries, info) {
    _classCallCheck(this, WebGPUObjects);

    this.geometries = geometries;
    this.info = info;
    this.updateMap = new WeakMap();
  }

  _createClass(WebGPUObjects, [{
    key: "update",
    value: function update(object) {
      var geometry = object.geometry;
      var updateMap = this.updateMap;
      var frame = this.info.render.frame;

      if (geometry.isBufferGeometry !== true) {
        throw 'THREE.WebGPURenderer: This renderer only supports THREE.BufferGeometry for geometries.';
      }

      if (updateMap.get(geometry) !== frame) {
        this.geometries.update(geometry);
        updateMap.set(geometry, frame);
      }
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.updateMap = new WeakMap();
    }
  }]);

  return WebGPUObjects;
}();

var _default = WebGPUObjects;
exports["default"] = _default;