"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WebGPUGeometries = /*#__PURE__*/function () {
  function WebGPUGeometries(attributes, info) {
    _classCallCheck(this, WebGPUGeometries);

    this.attributes = attributes;
    this.info = info;
    this.geometries = new WeakMap();
  }

  _createClass(WebGPUGeometries, [{
    key: "update",
    value: function update(geometry) {
      if (this.geometries.has(geometry) === false) {
        var disposeCallback = onGeometryDispose.bind(this);
        this.geometries.set(geometry, disposeCallback);
        this.info.memory.geometries++;
        geometry.addEventListener('dispose', disposeCallback);
      }

      var geometryAttributes = geometry.attributes;

      for (var name in geometryAttributes) {
        this.attributes.update(geometryAttributes[name]);
      }

      var index = geometry.index;

      if (index !== null) {
        this.attributes.update(index, true);
      }
    }
  }]);

  return WebGPUGeometries;
}();

function onGeometryDispose(event) {
  var geometry = event.target;
  var disposeCallback = this.geometries.get(geometry);
  this.geometries["delete"](geometry);
  this.info.memory.geometries--;
  geometry.removeEventListener('dispose', disposeCallback);
  var index = geometry.index;
  var geometryAttributes = geometry.attributes;

  if (index !== null) {
    this.attributes.remove(index);
  }

  for (var name in geometryAttributes) {
    this.attributes.remove(geometryAttributes[name]);
  }
}

var _default = WebGPUGeometries;
exports["default"] = _default;