"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _clearAlpha;

var _clearColor = new THREE.Color();

var WebGPUBackground = /*#__PURE__*/function () {
  function WebGPUBackground(renderer) {
    _classCallCheck(this, WebGPUBackground);

    this.renderer = renderer;
    this.forceClear = false;
  }

  _createClass(WebGPUBackground, [{
    key: "clear",
    value: function clear() {
      this.forceClear = true;
    }
  }, {
    key: "update",
    value: function update(scene) {
      var renderer = this.renderer;
      var background = scene.isScene === true ? scene.background : null;
      var forceClear = this.forceClear;

      if (background === null) {
        _clearColor.copy(renderer._clearColor);

        _clearAlpha = renderer._clearAlpha;
      } else if (background.isColor === true) {
        _clearColor.copy(background);

        _clearAlpha = 1;
        forceClear = true;
      } else {
        console.error('THREE.WebGPURenderer: Unsupported background configuration.', background);
      }

      var renderPassDescriptor = renderer._renderPassDescriptor;
      var colorAttachment = renderPassDescriptor.colorAttachments[0];
      var depthStencilAttachment = renderPassDescriptor.depthStencilAttachment;

      if (renderer.autoClear === true || forceClear === true) {
        if (renderer.autoClearColor === true) {
          colorAttachment.loadValue = {
            r: _clearColor.r,
            g: _clearColor.g,
            b: _clearColor.b,
            a: _clearAlpha
          };
        } else {
          colorAttachment.loadValue = THREE.GPULoadOp.Load;
        }

        if (renderer.autoClearDepth === true) {
          depthStencilAttachment.depthLoadValue = renderer._clearDepth;
        } else {
          depthStencilAttachment.depthLoadValue = GPULoadOp.Load;
        }

        if (renderer.autoClearStencil === true) {
          depthStencilAttachment.stencilLoadValue = renderer._clearDepth;
        } else {
          depthStencilAttachment.stencilLoadValue = GPULoadOp.Load;
        }
      } else {
        colorAttachment.loadValue = GPULoadOp.Load;
        depthStencilAttachment.depthLoadValue = GPULoadOp.Load;
        depthStencilAttachment.stencilLoadValue = GPULoadOp.Load;
      }

      this.forceClear = false;
    }
  }]);

  return WebGPUBackground;
}();

var _default = WebGPUBackground;
exports["default"] = _default;