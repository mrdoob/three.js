"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.AfterimagePass = void 0;

var AfterimagePass = function AfterimagePass(damp) {
  Pass.call(this);
  if (AfterimageShader === undefined) console.error("AfterimagePass relies on AfterimageShader");
  this.shader = AfterimageShader;
  this.uniforms = THREE.UniformsUtils.clone(this.shader.uniforms);
  this.uniforms["damp"].value = damp !== undefined ? damp : 0.96;
  this.textureComp = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.NearestFilter,
    format: RGBAFormat
  });
  this.textureOld = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
    minFilter: LinearFilter,
    magFilter: NearestFilter,
    format: RGBAFormat
  });
  this.shaderMaterial = new THREE.ShaderMaterial({
    uniforms: this.uniforms,
    vertexShader: this.shader.vertexShader,
    fragmentShader: this.shader.fragmentShader
  });
  this.compFsQuad = new THREE.Pass.FullScreenQuad(this.shaderMaterial);
  var material = new THREE.MeshBasicMaterial();
  this.copyFsQuad = new Pass.FullScreenQuad(material);
};

THREE.AfterimagePass = AfterimagePass;
AfterimagePass.prototype = Object.assign(Object.create(Pass.prototype), {
  constructor: AfterimagePass,
  render: function render(renderer, writeBuffer, readBuffer) {
    this.uniforms["tOld"].value = this.textureOld.texture;
    this.uniforms["tNew"].value = readBuffer.texture;
    renderer.setRenderTarget(this.textureComp);
    this.compFsQuad.render(renderer);
    this.copyFsQuad.material.map = this.textureComp.texture;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.copyFsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.copyFsQuad.render(renderer);
    }

    var temp = this.textureOld;
    this.textureOld = this.textureComp;
    this.textureComp = temp;
  },
  setSize: function setSize(width, height) {
    this.textureComp.setSize(width, height);
    this.textureOld.setSize(width, height);
  }
});