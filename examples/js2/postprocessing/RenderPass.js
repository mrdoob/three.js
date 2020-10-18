"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.RenderPass = void 0;

var RenderPass = function RenderPass(scene, camera, overrideMaterial, clearColor, clearAlpha) {
  Pass.call(this);
  this.scene = scene;
  this.camera = camera;
  this.overrideMaterial = overrideMaterial;
  this.clearColor = clearColor;
  this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;
  this.clear = true;
  this.clearDepth = false;
  this.needsSwap = false;
};

THREE.RenderPass = RenderPass;
RenderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
  constructor: RenderPass,
  render: function render(renderer, writeBuffer, readBuffer) {
    var oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    var oldClearColor, oldClearAlpha, oldOverrideMaterial;

    if (this.overrideMaterial !== undefined) {
      oldOverrideMaterial = this.scene.overrideMaterial;
      this.scene.overrideMaterial = this.overrideMaterial;
    }

    if (this.clearColor) {
      oldClearColor = renderer.getClearColor().getHex();
      oldClearAlpha = renderer.getClearAlpha();
      renderer.setClearColor(this.clearColor, this.clearAlpha);
    }

    if (this.clearDepth) {
      renderer.clearDepth();
    }

    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
    renderer.render(this.scene, this.camera);

    if (this.clearColor) {
      renderer.setClearColor(oldClearColor, oldClearAlpha);
    }

    if (this.overrideMaterial !== undefined) {
      this.scene.overrideMaterial = oldOverrideMaterial;
    }

    renderer.autoClear = oldAutoClear;
  }
});