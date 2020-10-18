"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.ShaderPass = void 0;

var ShaderPass = function ShaderPass(shader, textureID) {
  Pass.call(this);
  this.textureID = textureID !== undefined ? textureID : "tDiffuse";

  if (shader instanceof ShaderMaterial) {
    this.uniforms = shader.uniforms;
    this.material = shader;
  } else if (shader) {
    this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
    this.material = new ShaderMaterial({
      defines: Object.assign({}, shader.defines),
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    });
  }

  this.fsQuad = new THREE.Pass.FullScreenQuad(this.material);
};

THREE.ShaderPass = ShaderPass;
ShaderPass.prototype = Object.assign(Object.create(Pass.prototype), {
  constructor: ShaderPass,
  render: function render(renderer, writeBuffer, readBuffer) {
    if (this.uniforms[this.textureID]) {
      this.uniforms[this.textureID].value = readBuffer.texture;
    }

    this.fsQuad.material = this.material;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
      this.fsQuad.render(renderer);
    }
  }
});