"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WebGPUInfo = /*#__PURE__*/function () {
  function WebGPUInfo() {
    _classCallCheck(this, WebGPUInfo);

    this.autoReset = true;
    this.render = {
      frame: 0,
      drawCalls: 0,
      triangles: 0,
      points: 0,
      lines: 0
    };
    this.memory = {
      geometries: 0,
      textures: 0
    };
  }

  _createClass(WebGPUInfo, [{
    key: "update",
    value: function update(object, count, instanceCount) {
      this.render.drawCalls++;

      if (object.isMesh) {
        this.render.triangles += instanceCount * (count / 3);
      } else if (object.isPoints) {
        this.render.points += instanceCount * count;
      } else if (object.isLineSegments) {
        this.render.lines += instanceCount * (count / 2);
      } else if (object.isLine) {
        this.render.lines += instanceCount * (count - 1);
      } else {
        console.error('THREE.WebGPUInfo: Unknown object type.');
      }
    }
  }, {
    key: "reset",
    value: function reset() {
      this.render.frame++;
      this.render.drawCalls = 0;
      this.render.triangles = 0;
      this.render.points = 0;
      this.render.lines = 0;
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.reset();
      this.render.frame = 0;
      this.memory.geometries = 0;
      this.memory.textures = 0;
    }
  }]);

  return WebGPUInfo;
}();

var _default = WebGPUInfo;
exports["default"] = _default;