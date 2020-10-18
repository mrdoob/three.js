"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.SSAARenderPass = void 0;

var SSAARenderPass = function SSAARenderPass(scene, camera, clearColor, clearAlpha) {
  Pass.call(this);
  this.scene = scene;
  this.camera = camera;
  this.sampleLevel = 4;
  this.unbiased = true;
  this.clearColor = clearColor !== undefined ? clearColor : 0x000000;
  this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;
  if (CopyShader === undefined) console.error("SSAARenderPass relies on CopyShader");
  var copyShader = CopyShader;
  this.copyUniforms = THREE.UniformsUtils.clone(copyShader.uniforms);
  this.copyMaterial = new THREE.ShaderMaterial({
    uniforms: this.copyUniforms,
    vertexShader: copyShader.vertexShader,
    fragmentShader: copyShader.fragmentShader,
    premultipliedAlpha: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false
  });
  this.fsQuad = new THREE.Pass.FullScreenQuad(this.copyMaterial);
};

THREE.SSAARenderPass = SSAARenderPass;
SSAARenderPass.prototype = Object.assign(Object.create(Pass.prototype), {
  constructor: SSAARenderPass,
  dispose: function dispose() {
    if (this.sampleRenderTarget) {
      this.sampleRenderTarget.dispose();
      this.sampleRenderTarget = null;
    }
  },
  setSize: function setSize(width, height) {
    if (this.sampleRenderTarget) this.sampleRenderTarget.setSize(width, height);
  },
  render: function render(renderer, writeBuffer, readBuffer) {
    if (!this.sampleRenderTarget) {
      this.sampleRenderTarget = new THREE.WebGLRenderTarget(readBuffer.width, readBuffer.height, {
        minFilter: THREE.LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat
      });
      this.sampleRenderTarget.texture.name = "SSAARenderPass.sample";
    }

    var jitterOffsets = SSAARenderPass.JitterVectors[Math.max(0, Math.min(this.sampleLevel, 5))];
    var autoClear = renderer.autoClear;
    renderer.autoClear = false;
    var oldClearColor = renderer.getClearColor().getHex();
    var oldClearAlpha = renderer.getClearAlpha();
    var baseSampleWeight = 1.0 / jitterOffsets.length;
    var roundingRange = 1 / 32;
    this.copyUniforms["tDiffuse"].value = this.sampleRenderTarget.texture;
    var width = readBuffer.width,
        height = readBuffer.height;

    for (var i = 0; i < jitterOffsets.length; i++) {
      var jitterOffset = jitterOffsets[i];

      if (this.camera.setViewOffset) {
        this.camera.setViewOffset(width, height, jitterOffset[0] * 0.0625, jitterOffset[1] * 0.0625, width, height);
      }

      var sampleWeight = baseSampleWeight;

      if (this.unbiased) {
        var uniformCenteredDistribution = -0.5 + (i + 0.5) / jitterOffsets.length;
        sampleWeight += roundingRange * uniformCenteredDistribution;
      }

      this.copyUniforms["opacity"].value = sampleWeight;
      renderer.setClearColor(this.clearColor, this.clearAlpha);
      renderer.setRenderTarget(this.sampleRenderTarget);
      renderer.clear();
      renderer.render(this.scene, this.camera);
      renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);

      if (i === 0) {
        renderer.setClearColor(0x000000, 0.0);
        renderer.clear();
      }

      this.fsQuad.render(renderer);
    }

    if (this.camera.clearViewOffset) this.camera.clearViewOffset();
    renderer.autoClear = autoClear;
    renderer.setClearColor(oldClearColor, oldClearAlpha);
  }
});
SSAARenderPass.JitterVectors = [[[0, 0]], [[4, 4], [-4, -4]], [[-2, -6], [6, -2], [-6, 2], [2, 6]], [[1, -3], [-1, 3], [5, 1], [-3, -5], [-5, 5], [-7, -1], [3, 7], [7, -7]], [[1, 1], [-1, -3], [-3, 2], [4, -1], [-5, -2], [2, 5], [5, 3], [3, -5], [-2, 6], [0, -7], [-4, -6], [-6, 4], [-8, 0], [7, -4], [6, 7], [-7, -8]], [[-4, -7], [-7, -5], [-3, -5], [-5, -4], [-1, -4], [-2, -2], [-6, -1], [-4, 0], [-7, 1], [-1, 2], [-6, 3], [-3, 3], [-7, 6], [-3, 6], [-5, 7], [-1, 7], [5, -7], [1, -6], [6, -5], [4, -4], [2, -3], [7, -2], [1, -1], [4, -1], [2, 1], [6, 2], [0, 4], [4, 4], [2, 5], [7, 5], [5, 6], [3, 7]]];