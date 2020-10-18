"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.ClearPass = void 0;

var ClearPass = function ClearPass(clearColor, clearAlpha) {
  Pass.call(this);
  this.needsSwap = false;
  this.clearColor = clearColor !== undefined ? clearColor : 0x000000;
  this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;
};

THREE.ClearPass = ClearPass;
ClearPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
  constructor: ClearPass,
  render: function render(renderer, writeBuffer, readBuffer) {
    var oldClearColor, oldClearAlpha;

    if (this.clearColor) {
      oldClearColor = renderer.getClearColor().getHex();
      oldClearAlpha = renderer.getClearAlpha();
      renderer.setClearColor(this.clearColor, this.clearAlpha);
    }

    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    renderer.clear();

    if (this.clearColor) {
      renderer.setClearColor(oldClearColor, oldClearAlpha);
    }
  }
});