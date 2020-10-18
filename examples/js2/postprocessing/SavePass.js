"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.SavePass = void 0;

var SavePass = function SavePass(renderTarget) {
  Pass.call(this);
  if (CopyShader === undefined) console.error("SavePass relies on CopyShader");
  var shader = CopyShader;
  this.textureID = "tDiffuse";
  this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
  this.material = new THREE.ShaderMaterial({
    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader
  });
  this.renderTarget = renderTarget;

  if (this.renderTarget === undefined) {
    this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: LinearFilter,
      format: RGBFormat
    });
    this.renderTarget.texture.name = "SavePass.rt";
  }

  this.needsSwap = false;
  this.fsQuad = new THREE.Pass.FullScreenQuad(this.material);
};

THREE.SavePass = SavePass;
SavePass.prototype = Object.assign(Object.create(Pass.prototype), {
  constructor: SavePass,
  render: function render(renderer, writeBuffer, readBuffer) {
    if (this.uniforms[this.textureID]) {
      this.uniforms[this.textureID].value = readBuffer.texture;
    }

    renderer.setRenderTarget(this.renderTarget);
    if (this.clear) renderer.clear();
    this.fsQuad.render(renderer);
  }
});