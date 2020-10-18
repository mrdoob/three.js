"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.TexturePass = void 0;

var TexturePass = function TexturePass(map, opacity) {
  Pass.call(this);
  if (CopyShader === undefined) console.error("TexturePass relies on CopyShader");
  var shader = CopyShader;
  this.map = map;
  this.opacity = opacity !== undefined ? opacity : 1.0;
  this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
  this.material = new THREE.ShaderMaterial({
    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
    depthTest: false,
    depthWrite: false
  });
  this.needsSwap = false;
  this.fsQuad = new THREE.Pass.FullScreenQuad(null);
};

THREE.TexturePass = TexturePass;
TexturePass.prototype = Object.assign(Object.create(Pass.prototype), {
  constructor: TexturePass,
  render: function render(renderer, writeBuffer, readBuffer) {
    var oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    this.fsQuad.material = this.material;
    this.uniforms["opacity"].value = this.opacity;
    this.uniforms["tDiffuse"].value = this.map;
    this.material.transparent = this.opacity < 1.0;
    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    if (this.clear) renderer.clear();
    this.fsQuad.render(renderer);
    renderer.autoClear = oldAutoClear;
  }
});