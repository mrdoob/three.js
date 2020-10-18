"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.DotScreenPass = void 0;

var DotScreenPass = function DotScreenPass(center, angle, scale) {
  Pass.call(this);
  if (DotScreenShader === undefined) console.error("DotScreenPass relies on DotScreenShader");
  var shader = DotScreenShader;
  this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
  if (center !== undefined) this.uniforms["center"].value.copy(center);
  if (angle !== undefined) this.uniforms["angle"].value = angle;
  if (scale !== undefined) this.uniforms["scale"].value = scale;
  this.material = new THREE.ShaderMaterial({
    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader
  });
  this.fsQuad = new THREE.Pass.FullScreenQuad(this.material);
};

THREE.DotScreenPass = DotScreenPass;
DotScreenPass.prototype = Object.assign(Object.create(Pass.prototype), {
  constructor: DotScreenPass,
  render: function render(renderer, writeBuffer, readBuffer) {
    this.uniforms["tDiffuse"].value = readBuffer.texture;
    this.uniforms["tSize"].value.set(readBuffer.width, readBuffer.height);

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }
  }
});