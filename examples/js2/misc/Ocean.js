"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.Ocean = void 0;

var Ocean = function Ocean(renderer, camera, scene, options) {
  this.changed = true;
  this.initial = true;
  this.oceanCamera = new THREE.OrthographicCamera();
  this.oceanCamera.position.z = 1;
  this.renderer = renderer;
  this.renderer.clearColor(0xffffff);
  this.scene = new THREE.Scene();

  function optionalParameter(value, defaultValue) {
    return value !== undefined ? value : defaultValue;
  }

  options = options || {};
  this.clearColor = optionalParameter(options.CLEAR_COLOR, [1.0, 1.0, 1.0, 0.0]);
  this.geometryOrigin = optionalParameter(options.GEOMETRY_ORIGIN, [-1000.0, -1000.0]);
  this.sunDirectionX = optionalParameter(options.SUN_DIRECTION[0], -1.0);
  this.sunDirectionY = optionalParameter(options.SUN_DIRECTION[1], 1.0);
  this.sunDirectionZ = optionalParameter(options.SUN_DIRECTION[2], 1.0);
  this.oceanColor = optionalParameter(options.OCEAN_COLOR, new THREE.Vector3(0.004, 0.016, 0.047));
  this.skyColor = optionalParameter(options.SKY_COLOR, new Vector3(3.2, 9.6, 12.8));
  this.exposure = optionalParameter(options.EXPOSURE, 0.35);
  this.geometryResolution = optionalParameter(options.GEOMETRY_RESOLUTION, 32);
  this.geometrySize = optionalParameter(options.GEOMETRY_SIZE, 2000);
  this.resolution = optionalParameter(options.RESOLUTION, 64);
  this.floatSize = optionalParameter(options.SIZE_OF_FLOAT, 4);
  this.windX = optionalParameter(options.INITIAL_WIND[0], 10.0);
  this.windY = optionalParameter(options.INITIAL_WIND[1], 10.0);
  this.size = optionalParameter(options.INITIAL_SIZE, 250.0);
  this.choppiness = optionalParameter(options.INITIAL_CHOPPINESS, 1.5);
  this.matrixNeedsUpdate = false;
  var renderTargetType = optionalParameter(options.USE_HALF_FLOAT, false) ? HalfFloatType : THREE.FloatType;
  var LinearClampParams = {
    minFilter: THREE.LinearFilter,
    magFilter: LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: ClampToEdgeWrapping,
    format: THREE.RGBAFormat,
    depthBuffer: false,
    premultiplyAlpha: false,
    type: renderTargetType
  };
  var NearestClampParams = {
    minFilter: THREE.NearestFilter,
    magFilter: NearestFilter,
    wrapS: ClampToEdgeWrapping,
    wrapT: ClampToEdgeWrapping,
    format: RGBAFormat,
    depthBuffer: false,
    premultiplyAlpha: false,
    type: renderTargetType
  };
  var NearestRepeatParams = {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    wrapS: THREE.RepeatWrapping,
    wrapT: RepeatWrapping,
    format: RGBAFormat,
    depthBuffer: false,
    premultiplyAlpha: false,
    type: renderTargetType
  };
  this.initialSpectrumFramebuffer = new THREE.WebGLRenderTarget(this.resolution, this.resolution, NearestRepeatParams);
  this.spectrumFramebuffer = new WebGLRenderTarget(this.resolution, this.resolution, NearestClampParams);
  this.pingPhaseFramebuffer = new WebGLRenderTarget(this.resolution, this.resolution, NearestClampParams);
  this.pongPhaseFramebuffer = new WebGLRenderTarget(this.resolution, this.resolution, NearestClampParams);
  this.pingTransformFramebuffer = new WebGLRenderTarget(this.resolution, this.resolution, NearestClampParams);
  this.pongTransformFramebuffer = new WebGLRenderTarget(this.resolution, this.resolution, NearestClampParams);
  this.displacementMapFramebuffer = new WebGLRenderTarget(this.resolution, this.resolution, LinearClampParams);
  this.normalMapFramebuffer = new WebGLRenderTarget(this.resolution, this.resolution, LinearClampParams);
  var fullscreeenVertexShader = THREE.OceanShaders["ocean_sim_vertex"];
  var oceanHorizontalShader = OceanShaders["ocean_subtransform"];
  var oceanHorizontalUniforms = THREE.UniformsUtils.clone(oceanHorizontalShader.uniforms);
  this.materialOceanHorizontal = new THREE.ShaderMaterial({
    uniforms: oceanHorizontalUniforms,
    vertexShader: fullscreeenVertexShader.vertexShader,
    fragmentShader: "#define HORIZONTAL \n" + oceanHorizontalShader.fragmentShader
  });
  this.materialOceanHorizontal.uniforms.u_transformSize = {
    value: this.resolution
  };
  this.materialOceanHorizontal.uniforms.u_subtransformSize = {
    value: null
  };
  this.materialOceanHorizontal.uniforms.u_input = {
    value: null
  };
  this.materialOceanHorizontal.depthTest = false;
  var oceanVerticalShader = OceanShaders["ocean_subtransform"];
  var oceanVerticalUniforms = UniformsUtils.clone(oceanVerticalShader.uniforms);
  this.materialOceanVertical = new ShaderMaterial({
    uniforms: oceanVerticalUniforms,
    vertexShader: fullscreeenVertexShader.vertexShader,
    fragmentShader: oceanVerticalShader.fragmentShader
  });
  this.materialOceanVertical.uniforms.u_transformSize = {
    value: this.resolution
  };
  this.materialOceanVertical.uniforms.u_subtransformSize = {
    value: null
  };
  this.materialOceanVertical.uniforms.u_input = {
    value: null
  };
  this.materialOceanVertical.depthTest = false;
  var initialSpectrumShader = OceanShaders["ocean_initial_spectrum"];
  var initialSpectrumUniforms = UniformsUtils.clone(initialSpectrumShader.uniforms);
  this.materialInitialSpectrum = new ShaderMaterial({
    uniforms: initialSpectrumUniforms,
    vertexShader: initialSpectrumShader.vertexShader,
    fragmentShader: initialSpectrumShader.fragmentShader
  });
  this.materialInitialSpectrum.uniforms.u_wind = {
    value: new THREE.Vector2()
  };
  this.materialInitialSpectrum.uniforms.u_resolution = {
    value: this.resolution
  };
  this.materialInitialSpectrum.depthTest = false;
  var phaseShader = OceanShaders["ocean_phase"];
  var phaseUniforms = UniformsUtils.clone(phaseShader.uniforms);
  this.materialPhase = new ShaderMaterial({
    uniforms: phaseUniforms,
    vertexShader: fullscreeenVertexShader.vertexShader,
    fragmentShader: phaseShader.fragmentShader
  });
  this.materialPhase.uniforms.u_resolution = {
    value: this.resolution
  };
  this.materialPhase.depthTest = false;
  var spectrumShader = OceanShaders["ocean_spectrum"];
  var spectrumUniforms = UniformsUtils.clone(spectrumShader.uniforms);
  this.materialSpectrum = new ShaderMaterial({
    uniforms: spectrumUniforms,
    vertexShader: fullscreeenVertexShader.vertexShader,
    fragmentShader: spectrumShader.fragmentShader
  });
  this.materialSpectrum.uniforms.u_initialSpectrum = {
    value: null
  };
  this.materialSpectrum.uniforms.u_resolution = {
    value: this.resolution
  };
  this.materialSpectrum.depthTest = false;
  var normalShader = OceanShaders["ocean_normals"];
  var normalUniforms = UniformsUtils.clone(normalShader.uniforms);
  this.materialNormal = new ShaderMaterial({
    uniforms: normalUniforms,
    vertexShader: fullscreeenVertexShader.vertexShader,
    fragmentShader: normalShader.fragmentShader
  });
  this.materialNormal.uniforms.u_displacementMap = {
    value: null
  };
  this.materialNormal.uniforms.u_resolution = {
    value: this.resolution
  };
  this.materialNormal.depthTest = false;
  var oceanShader = OceanShaders["ocean_main"];
  var oceanUniforms = UniformsUtils.clone(oceanShader.uniforms);
  this.materialOcean = new ShaderMaterial({
    uniforms: oceanUniforms,
    vertexShader: oceanShader.vertexShader,
    fragmentShader: oceanShader.fragmentShader
  });
  this.materialOcean.uniforms.u_geometrySize = {
    value: this.resolution
  };
  this.materialOcean.uniforms.u_displacementMap = {
    value: this.displacementMapFramebuffer.texture
  };
  this.materialOcean.uniforms.u_normalMap = {
    value: this.normalMapFramebuffer.texture
  };
  this.materialOcean.uniforms.u_oceanColor = {
    value: this.oceanColor
  };
  this.materialOcean.uniforms.u_skyColor = {
    value: this.skyColor
  };
  this.materialOcean.uniforms.u_sunDirection = {
    value: new Vector3(this.sunDirectionX, this.sunDirectionY, this.sunDirectionZ)
  };
  this.materialOcean.uniforms.u_exposure = {
    value: this.exposure
  };
  this.materialOcean.uniforms.u_size = {
    value: this.size
  };
  this.materialOceanHorizontal.blending = 0;
  this.materialOceanVertical.blending = 0;
  this.materialInitialSpectrum.blending = 0;
  this.materialPhase.blending = 0;
  this.materialSpectrum.blending = 0;
  this.materialNormal.blending = 0;
  this.materialOcean.blending = 0;
  this.screenQuad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2));
  this.scene.add(this.screenQuad);
  this.generateSeedPhaseTexture();
  this.generateMesh();
};

THREE.Ocean = Ocean;

Ocean.prototype.generateMesh = function () {
  var geometry = new PlaneBufferGeometry(this.geometrySize, this.geometrySize, this.geometryResolution, this.geometryResolution);
  geometry.rotateX(-Math.PI / 2);
  this.oceanMesh = new Mesh(geometry, this.materialOcean);
};

Ocean.prototype.render = function () {
  var currentRenderTarget = this.renderer.getRenderTarget();
  this.scene.overrideMaterial = null;
  if (this.changed) this.renderInitialSpectrum();
  this.renderWavePhase();
  this.renderSpectrum();
  this.renderSpectrumFFT();
  this.renderNormalMap();
  this.scene.overrideMaterial = null;
  this.renderer.setRenderTarget(currentRenderTarget);
};

Ocean.prototype.generateSeedPhaseTexture = function () {
  this.pingPhase = true;
  var phaseArray = new window.Float32Array(this.resolution * this.resolution * 4);

  for (var i = 0; i < this.resolution; i++) {
    for (var j = 0; j < this.resolution; j++) {
      phaseArray[i * this.resolution * 4 + j * 4] = Math.random() * 2.0 * Math.PI;
      phaseArray[i * this.resolution * 4 + j * 4 + 1] = 0.0;
      phaseArray[i * this.resolution * 4 + j * 4 + 2] = 0.0;
      phaseArray[i * this.resolution * 4 + j * 4 + 3] = 0.0;
    }
  }

  this.pingPhaseTexture = new THREE.DataTexture(phaseArray, this.resolution, this.resolution, RGBAFormat);
  this.pingPhaseTexture.wrapS = ClampToEdgeWrapping;
  this.pingPhaseTexture.wrapT = ClampToEdgeWrapping;
  this.pingPhaseTexture.type = FloatType;
};

Ocean.prototype.renderInitialSpectrum = function () {
  this.scene.overrideMaterial = this.materialInitialSpectrum;
  this.materialInitialSpectrum.uniforms.u_wind.value.set(this.windX, this.windY);
  this.materialInitialSpectrum.uniforms.u_size.value = this.size;
  this.renderer.setRenderTarget(this.initialSpectrumFramebuffer);
  this.renderer.clear();
  this.renderer.render(this.scene, this.oceanCamera);
};

Ocean.prototype.renderWavePhase = function () {
  this.scene.overrideMaterial = this.materialPhase;
  this.screenQuad.material = this.materialPhase;

  if (this.initial) {
    this.materialPhase.uniforms.u_phases.value = this.pingPhaseTexture;
    this.initial = false;
  } else {
    this.materialPhase.uniforms.u_phases.value = this.pingPhase ? this.pingPhaseFramebuffer.texture : this.pongPhaseFramebuffer.texture;
  }

  this.materialPhase.uniforms.u_deltaTime.value = this.deltaTime;
  this.materialPhase.uniforms.u_size.value = this.size;
  this.renderer.setRenderTarget(this.pingPhase ? this.pongPhaseFramebuffer : this.pingPhaseFramebuffer);
  this.renderer.render(this.scene, this.oceanCamera);
  this.pingPhase = !this.pingPhase;
};

Ocean.prototype.renderSpectrum = function () {
  this.scene.overrideMaterial = this.materialSpectrum;
  this.materialSpectrum.uniforms.u_initialSpectrum.value = this.initialSpectrumFramebuffer.texture;
  this.materialSpectrum.uniforms.u_phases.value = this.pingPhase ? this.pingPhaseFramebuffer.texture : this.pongPhaseFramebuffer.texture;
  this.materialSpectrum.uniforms.u_choppiness.value = this.choppiness;
  this.materialSpectrum.uniforms.u_size.value = this.size;
  this.renderer.setRenderTarget(this.spectrumFramebuffer);
  this.renderer.render(this.scene, this.oceanCamera);
};

Ocean.prototype.renderSpectrumFFT = function () {
  var iterations = Math.log(this.resolution) / Math.log(2);
  this.scene.overrideMaterial = this.materialOceanHorizontal;

  for (var i = 0; i < iterations; i++) {
    if (i === 0) {
      this.materialOceanHorizontal.uniforms.u_input.value = this.spectrumFramebuffer.texture;
      this.materialOceanHorizontal.uniforms.u_subtransformSize.value = Math.pow(2, i % iterations + 1);
      this.renderer.setRenderTarget(this.pingTransformFramebuffer);
      this.renderer.render(this.scene, this.oceanCamera);
    } else if (i % 2 === 1) {
      this.materialOceanHorizontal.uniforms.u_input.value = this.pingTransformFramebuffer.texture;
      this.materialOceanHorizontal.uniforms.u_subtransformSize.value = Math.pow(2, i % iterations + 1);
      this.renderer.setRenderTarget(this.pongTransformFramebuffer);
      this.renderer.render(this.scene, this.oceanCamera);
    } else {
      this.materialOceanHorizontal.uniforms.u_input.value = this.pongTransformFramebuffer.texture;
      this.materialOceanHorizontal.uniforms.u_subtransformSize.value = Math.pow(2, i % iterations + 1);
      this.renderer.setRenderTarget(this.pingTransformFramebuffer);
      this.renderer.render(this.scene, this.oceanCamera);
    }
  }

  this.scene.overrideMaterial = this.materialOceanVertical;

  for (var i = iterations; i < iterations * 2; i++) {
    if (i === iterations * 2 - 1) {
      this.materialOceanVertical.uniforms.u_input.value = iterations % 2 === 0 ? this.pingTransformFramebuffer.texture : this.pongTransformFramebuffer.texture;
      this.materialOceanVertical.uniforms.u_subtransformSize.value = Math.pow(2, i % iterations + 1);
      this.renderer.setRenderTarget(this.displacementMapFramebuffer);
      this.renderer.render(this.scene, this.oceanCamera);
    } else if (i % 2 === 1) {
      this.materialOceanVertical.uniforms.u_input.value = this.pingTransformFramebuffer.texture;
      this.materialOceanVertical.uniforms.u_subtransformSize.value = Math.pow(2, i % iterations + 1);
      this.renderer.setRenderTarget(this.pongTransformFramebuffer);
      this.renderer.render(this.scene, this.oceanCamera);
    } else {
      this.materialOceanVertical.uniforms.u_input.value = this.pongTransformFramebuffer.texture;
      this.materialOceanVertical.uniforms.u_subtransformSize.value = Math.pow(2, i % iterations + 1);
      this.renderer.setRenderTarget(this.pingTransformFramebuffer);
      this.renderer.render(this.scene, this.oceanCamera);
    }
  }
};

Ocean.prototype.renderNormalMap = function () {
  this.scene.overrideMaterial = this.materialNormal;
  if (this.changed) this.materialNormal.uniforms.u_size.value = this.size;
  this.materialNormal.uniforms.u_displacementMap.value = this.displacementMapFramebuffer.texture;
  this.renderer.setRenderTarget(this.normalMapFramebuffer);
  this.renderer.clear();
  this.renderer.render(this.scene, this.oceanCamera);
};