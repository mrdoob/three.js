"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.FilmPass = void 0;

var FilmPass = function FilmPass(noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale) {
  Pass.call(this);
  if (FilmShader === undefined) console.error("FilmPass relies on FilmShader");
  var shader = FilmShader;
  this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
  this.material = new THREE.ShaderMaterial({
    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader
  });
  if (grayscale !== undefined) this.uniforms.grayscale.value = grayscale;
  if (noiseIntensity !== undefined) this.uniforms.nIntensity.value = noiseIntensity;
  if (scanlinesIntensity !== undefined) this.uniforms.sIntensity.value = scanlinesIntensity;
  if (scanlinesCount !== undefined) this.uniforms.sCount.value = scanlinesCount;
  this.fsQuad = new THREE.Pass.FullScreenQuad(this.material);
};

THREE.FilmPass = FilmPass;
FilmPass.prototype = Object.assign(Object.create(Pass.prototype), {
  constructor: FilmPass,
  render: function render(renderer, writeBuffer, readBuffer, deltaTime) {
    this.uniforms["tDiffuse"].value = readBuffer.texture;
    this.uniforms["time"].value += deltaTime;

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