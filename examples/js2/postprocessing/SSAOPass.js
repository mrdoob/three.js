"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.SSAOPass = void 0;

var SSAOPass = function SSAOPass(scene, camera, width, height) {
  Pass.call(this);
  this.width = width !== undefined ? width : 512;
  this.height = height !== undefined ? height : 512;
  this.clear = true;
  this.camera = camera;
  this.scene = scene;
  this.kernelRadius = 8;
  this.kernelSize = 32;
  this.kernel = [];
  this.noiseTexture = null;
  this.output = 0;
  this.minDistance = 0.005;
  this.maxDistance = 0.1;
  this._visibilityCache = new Map();
  this.generateSampleKernel();
  this.generateRandomKernelRotations();
  var depthTexture = new THREE.DepthTexture();
  depthTexture.type = THREE.UnsignedShortType;
  depthTexture.minFilter = THREE.NearestFilter;
  depthTexture.maxFilter = NearestFilter;
  this.beautyRenderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
    minFilter: THREE.LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat
  });
  this.normalRenderTarget = new WebGLRenderTarget(this.width, this.height, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    depthTexture: depthTexture
  });
  this.ssaoRenderTarget = new WebGLRenderTarget(this.width, this.height, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat
  });
  this.blurRenderTarget = this.ssaoRenderTarget.clone();

  if (SSAOShader === undefined) {
    console.error('THREE.SSAOPass: The pass relies on SSAOShader.');
  }

  this.ssaoMaterial = new THREE.ShaderMaterial({
    defines: Object.assign({}, SSAOShader.defines),
    uniforms: THREE.UniformsUtils.clone(SSAOShader.uniforms),
    vertexShader: SSAOShader.vertexShader,
    fragmentShader: SSAOShader.fragmentShader,
    blending: NoBlending
  });
  this.ssaoMaterial.uniforms['tDiffuse'].value = this.beautyRenderTarget.texture;
  this.ssaoMaterial.uniforms['tNormal'].value = this.normalRenderTarget.texture;
  this.ssaoMaterial.uniforms['tDepth'].value = this.normalRenderTarget.depthTexture;
  this.ssaoMaterial.uniforms['tNoise'].value = this.noiseTexture;
  this.ssaoMaterial.uniforms['kernel'].value = this.kernel;
  this.ssaoMaterial.uniforms['cameraNear'].value = this.camera.near;
  this.ssaoMaterial.uniforms['cameraFar'].value = this.camera.far;
  this.ssaoMaterial.uniforms['resolution'].value.set(this.width, this.height);
  this.ssaoMaterial.uniforms['cameraProjectionMatrix'].value.copy(this.camera.projectionMatrix);
  this.ssaoMaterial.uniforms['cameraInverseProjectionMatrix'].value.getInverse(this.camera.projectionMatrix);
  this.normalMaterial = new THREE.MeshNormalMaterial();
  this.normalMaterial.blending = NoBlending;
  this.blurMaterial = new ShaderMaterial({
    defines: Object.assign({}, THREE.SSAOBlurShader.defines),
    uniforms: UniformsUtils.clone(SSAOBlurShader.uniforms),
    vertexShader: SSAOBlurShader.vertexShader,
    fragmentShader: SSAOBlurShader.fragmentShader
  });
  this.blurMaterial.uniforms['tDiffuse'].value = this.ssaoRenderTarget.texture;
  this.blurMaterial.uniforms['resolution'].value.set(this.width, this.height);
  this.depthRenderMaterial = new ShaderMaterial({
    defines: Object.assign({}, THREE.SSAODepthShader.defines),
    uniforms: UniformsUtils.clone(SSAODepthShader.uniforms),
    vertexShader: SSAODepthShader.vertexShader,
    fragmentShader: SSAODepthShader.fragmentShader,
    blending: NoBlending
  });
  this.depthRenderMaterial.uniforms['tDepth'].value = this.normalRenderTarget.depthTexture;
  this.depthRenderMaterial.uniforms['cameraNear'].value = this.camera.near;
  this.depthRenderMaterial.uniforms['cameraFar'].value = this.camera.far;
  this.copyMaterial = new ShaderMaterial({
    uniforms: UniformsUtils.clone(THREE.CopyShader.uniforms),
    vertexShader: CopyShader.vertexShader,
    fragmentShader: CopyShader.fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blendSrc: THREE.DstColorFactor,
    blendDst: THREE.ZeroFactor,
    blendEquation: THREE.AddEquation,
    blendSrcAlpha: THREE.DstAlphaFactor,
    blendDstAlpha: ZeroFactor,
    blendEquationAlpha: AddEquation
  });
  this.fsQuad = new THREE.Pass.FullScreenQuad(null);
  this.originalClearColor = new THREE.Color();
};

THREE.SSAOPass = SSAOPass;
SSAOPass.prototype = Object.assign(Object.create(Pass.prototype), {
  constructor: SSAOPass,
  dispose: function dispose() {
    this.beautyRenderTarget.dispose();
    this.normalRenderTarget.dispose();
    this.ssaoRenderTarget.dispose();
    this.blurRenderTarget.dispose();
    this.normalMaterial.dispose();
    this.blurMaterial.dispose();
    this.copyMaterial.dispose();
    this.depthRenderMaterial.dispose();
    this.fsQuad.dispose();
  },
  render: function render(renderer, writeBuffer) {
    renderer.setRenderTarget(this.beautyRenderTarget);
    renderer.clear();
    renderer.render(this.scene, this.camera);
    this.overrideVisibility();
    this.renderOverride(renderer, this.normalMaterial, this.normalRenderTarget, 0x7777ff, 1.0);
    this.restoreVisibility();
    this.ssaoMaterial.uniforms['kernelRadius'].value = this.kernelRadius;
    this.ssaoMaterial.uniforms['minDistance'].value = this.minDistance;
    this.ssaoMaterial.uniforms['maxDistance'].value = this.maxDistance;
    this.renderPass(renderer, this.ssaoMaterial, this.ssaoRenderTarget);
    this.renderPass(renderer, this.blurMaterial, this.blurRenderTarget);

    switch (this.output) {
      case SSAOPass.OUTPUT.SSAO:
        this.copyMaterial.uniforms['tDiffuse'].value = this.ssaoRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);
        break;

      case SSAOPass.OUTPUT.Blur:
        this.copyMaterial.uniforms['tDiffuse'].value = this.blurRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);
        break;

      case SSAOPass.OUTPUT.Beauty:
        this.copyMaterial.uniforms['tDiffuse'].value = this.beautyRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);
        break;

      case SSAOPass.OUTPUT.Depth:
        this.renderPass(renderer, this.depthRenderMaterial, this.renderToScreen ? null : writeBuffer);
        break;

      case SSAOPass.OUTPUT.Normal:
        this.copyMaterial.uniforms['tDiffuse'].value = this.normalRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);
        break;

      case SSAOPass.OUTPUT.Default:
        this.copyMaterial.uniforms['tDiffuse'].value = this.beautyRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);
        this.copyMaterial.uniforms['tDiffuse'].value = this.blurRenderTarget.texture;
        this.copyMaterial.blending = THREE.CustomBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);
        break;

      default:
        console.warn('THREE.SSAOPass: Unknown output type.');
    }
  },
  renderPass: function renderPass(renderer, passMaterial, renderTarget, clearColor, clearAlpha) {
    this.originalClearColor.copy(renderer.getClearColor());
    var originalClearAlpha = renderer.getClearAlpha();
    var originalAutoClear = renderer.autoClear;
    renderer.setRenderTarget(renderTarget);
    renderer.autoClear = false;

    if (clearColor !== undefined && clearColor !== null) {
      renderer.setClearColor(clearColor);
      renderer.setClearAlpha(clearAlpha || 0.0);
      renderer.clear();
    }

    this.fsQuad.material = passMaterial;
    this.fsQuad.render(renderer);
    renderer.autoClear = originalAutoClear;
    renderer.setClearColor(this.originalClearColor);
    renderer.setClearAlpha(originalClearAlpha);
  },
  renderOverride: function renderOverride(renderer, overrideMaterial, renderTarget, clearColor, clearAlpha) {
    this.originalClearColor.copy(renderer.getClearColor());
    var originalClearAlpha = renderer.getClearAlpha();
    var originalAutoClear = renderer.autoClear;
    renderer.setRenderTarget(renderTarget);
    renderer.autoClear = false;
    clearColor = overrideMaterial.clearColor || clearColor;
    clearAlpha = overrideMaterial.clearAlpha || clearAlpha;

    if (clearColor !== undefined && clearColor !== null) {
      renderer.setClearColor(clearColor);
      renderer.setClearAlpha(clearAlpha || 0.0);
      renderer.clear();
    }

    this.scene.overrideMaterial = overrideMaterial;
    renderer.render(this.scene, this.camera);
    this.scene.overrideMaterial = null;
    renderer.autoClear = originalAutoClear;
    renderer.setClearColor(this.originalClearColor);
    renderer.setClearAlpha(originalClearAlpha);
  },
  setSize: function setSize(width, height) {
    this.width = width;
    this.height = height;
    this.beautyRenderTarget.setSize(width, height);
    this.ssaoRenderTarget.setSize(width, height);
    this.normalRenderTarget.setSize(width, height);
    this.blurRenderTarget.setSize(width, height);
    this.ssaoMaterial.uniforms['resolution'].value.set(width, height);
    this.ssaoMaterial.uniforms['cameraProjectionMatrix'].value.copy(this.camera.projectionMatrix);
    this.ssaoMaterial.uniforms['cameraInverseProjectionMatrix'].value.getInverse(this.camera.projectionMatrix);
    this.blurMaterial.uniforms['resolution'].value.set(width, height);
  },
  generateSampleKernel: function generateSampleKernel() {
    var kernelSize = this.kernelSize;
    var kernel = this.kernel;

    for (var i = 0; i < kernelSize; i++) {
      var sample = new THREE.Vector3();
      sample.x = Math.random() * 2 - 1;
      sample.y = Math.random() * 2 - 1;
      sample.z = Math.random();
      sample.normalize();
      var scale = i / kernelSize;
      scale = THREE.MathUtils.lerp(0.1, 1, scale * scale);
      sample.multiplyScalar(scale);
      kernel.push(sample);
    }
  },
  generateRandomKernelRotations: function generateRandomKernelRotations() {
    var width = 4,
        height = 4;

    if (SimplexNoise === undefined) {
      console.error('THREE.SSAOPass: The pass relies on SimplexNoise.');
    }

    var simplex = new SimplexNoise();
    var size = width * height;
    var data = new Float32Array(size * 4);

    for (var i = 0; i < size; i++) {
      var stride = i * 4;
      var x = Math.random() * 2 - 1;
      var y = Math.random() * 2 - 1;
      var z = 0;
      var noise = simplex.noise3d(x, y, z);
      data[stride] = noise;
      data[stride + 1] = noise;
      data[stride + 2] = noise;
      data[stride + 3] = 1;
    }

    this.noiseTexture = new THREE.DataTexture(data, width, height, RGBAFormat, FloatType);
    this.noiseTexture.wrapS = THREE.RepeatWrapping;
    this.noiseTexture.wrapT = RepeatWrapping;
  },
  overrideVisibility: function overrideVisibility() {
    var scene = this.scene;
    var cache = this._visibilityCache;
    scene.traverse(function (object) {
      cache.set(object, object.visible);
      if (object.isPoints || object.isLine) object.visible = false;
    });
  },
  restoreVisibility: function restoreVisibility() {
    var scene = this.scene;
    var cache = this._visibilityCache;
    scene.traverse(function (object) {
      var visible = cache.get(object);
      object.visible = visible;
    });
    cache.clear();
  }
});
SSAOPass.OUTPUT = {
  'Default': 0,
  'SSAO': 1,
  'Blur': 2,
  'Beauty': 3,
  'Depth': 4,
  'Normal': 5
};