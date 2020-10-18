"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.ClearMaskPass = THREE.MaskPass = void 0;

var MaskPass = function MaskPass(scene, camera) {
  Pass.call(this);
  this.scene = scene;
  this.camera = camera;
  this.clear = true;
  this.needsSwap = false;
  this.inverse = false;
};

THREE.MaskPass = MaskPass;
MaskPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
  constructor: MaskPass,
  render: function render(renderer, writeBuffer, readBuffer) {
    var context = renderer.getContext();
    var state = renderer.state;
    state.buffers.color.setMask(false);
    state.buffers.depth.setMask(false);
    state.buffers.color.setLocked(true);
    state.buffers.depth.setLocked(true);
    var writeValue, clearValue;

    if (this.inverse) {
      writeValue = 0;
      clearValue = 1;
    } else {
      writeValue = 1;
      clearValue = 0;
    }

    state.buffers.stencil.setTest(true);
    state.buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE);
    state.buffers.stencil.setFunc(context.ALWAYS, writeValue, 0xffffffff);
    state.buffers.stencil.setClear(clearValue);
    state.buffers.stencil.setLocked(true);
    renderer.setRenderTarget(readBuffer);
    if (this.clear) renderer.clear();
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(writeBuffer);
    if (this.clear) renderer.clear();
    renderer.render(this.scene, this.camera);
    state.buffers.color.setLocked(false);
    state.buffers.depth.setLocked(false);
    state.buffers.stencil.setLocked(false);
    state.buffers.stencil.setFunc(context.EQUAL, 1, 0xffffffff);
    state.buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
    state.buffers.stencil.setLocked(true);
  }
});

var ClearMaskPass = function ClearMaskPass() {
  Pass.call(this);
  this.needsSwap = false;
};

THREE.ClearMaskPass = ClearMaskPass;
ClearMaskPass.prototype = Object.create(Pass.prototype);
Object.assign(ClearMaskPass.prototype, {
  render: function render(renderer) {
    renderer.state.buffers.stencil.setLocked(false);
    renderer.state.buffers.stencil.setTest(false);
  }
});