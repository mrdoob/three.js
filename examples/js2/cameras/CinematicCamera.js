"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.CinematicCamera = void 0;

var CinematicCamera = function CinematicCamera(fov, aspect, near, far) {
  PerspectiveCamera.call(this, fov, aspect, near, far);
  this.type = 'CinematicCamera';
  this.postprocessing = {
    enabled: true
  };
  this.shaderSettings = {
    rings: 3,
    samples: 4
  };
  var depthShader = THREE.BokehDepthShader;
  this.materialDepth = new THREE.ShaderMaterial({
    uniforms: depthShader.uniforms,
    vertexShader: depthShader.vertexShader,
    fragmentShader: depthShader.fragmentShader
  });
  this.materialDepth.uniforms['mNear'].value = near;
  this.materialDepth.uniforms['mFar'].value = far;
  this.setLens();
  this.initPostProcessing();
};

THREE.CinematicCamera = CinematicCamera;
CinematicCamera.prototype = Object.create(THREE.PerspectiveCamera.prototype);
CinematicCamera.prototype.constructor = CinematicCamera;

CinematicCamera.prototype.setLens = function (focalLength, filmGauge, fNumber, coc) {
  if (focalLength === undefined) focalLength = 35;
  if (filmGauge !== undefined) this.filmGauge = filmGauge;
  this.setFocalLength(focalLength);
  if (fNumber === undefined) fNumber = 8;
  if (coc === undefined) coc = 0.019;
  this.fNumber = fNumber;
  this.coc = coc;
  this.aperture = focalLength / this.fNumber;
  this.hyperFocal = focalLength * focalLength / (this.aperture * this.coc);
};

CinematicCamera.prototype.linearize = function (depth) {
  var zfar = this.far;
  var znear = this.near;
  return -zfar * znear / (depth * (zfar - znear) - zfar);
};

CinematicCamera.prototype.smoothstep = function (near, far, depth) {
  var x = this.saturate((depth - near) / (far - near));
  return x * x * (3 - 2 * x);
};

CinematicCamera.prototype.saturate = function (x) {
  return Math.max(0, Math.min(1, x));
};

CinematicCamera.prototype.focusAt = function (focusDistance) {
  if (focusDistance === undefined) focusDistance = 20;
  var focalLength = this.getFocalLength();
  this.focus = focusDistance;
  this.nearPoint = this.hyperFocal * this.focus / (this.hyperFocal + (this.focus - focalLength));
  this.farPoint = this.hyperFocal * this.focus / (this.hyperFocal - (this.focus - focalLength));
  this.depthOfField = this.farPoint - this.nearPoint;
  if (this.depthOfField < 0) this.depthOfField = 0;
  this.sdistance = this.smoothstep(this.near, this.far, this.focus);
  this.ldistance = this.linearize(1 - this.sdistance);
  this.postprocessing.bokeh_uniforms['focalDepth'].value = this.ldistance;
};

CinematicCamera.prototype.initPostProcessing = function () {
  if (this.postprocessing.enabled) {
    this.postprocessing.scene = new THREE.Scene();
    this.postprocessing.camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -10000, 10000);
    this.postprocessing.scene.add(this.postprocessing.camera);
    var pars = {
      minFilter: THREE.LinearFilter,
      magFilter: LinearFilter,
      format: RGBFormat
    };
    this.postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);
    this.postprocessing.rtTextureColor = new WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);
    var bokeh_shader = THREE.BokehShader;
    this.postprocessing.bokeh_uniforms = THREE.UniformsUtils.clone(bokeh_shader.uniforms);
    this.postprocessing.bokeh_uniforms["tColor"].value = this.postprocessing.rtTextureColor.texture;
    this.postprocessing.bokeh_uniforms["tDepth"].value = this.postprocessing.rtTextureDepth.texture;
    this.postprocessing.bokeh_uniforms["manualdof"].value = 0;
    this.postprocessing.bokeh_uniforms["shaderFocus"].value = 0;
    this.postprocessing.bokeh_uniforms["fstop"].value = 2.8;
    this.postprocessing.bokeh_uniforms["showFocus"].value = 1;
    this.postprocessing.bokeh_uniforms["focalDepth"].value = 0.1;
    this.postprocessing.bokeh_uniforms["znear"].value = this.near;
    this.postprocessing.bokeh_uniforms["zfar"].value = this.near;
    this.postprocessing.bokeh_uniforms["textureWidth"].value = window.innerWidth;
    this.postprocessing.bokeh_uniforms["textureHeight"].value = window.innerHeight;
    this.postprocessing.materialBokeh = new ShaderMaterial({
      uniforms: this.postprocessing.bokeh_uniforms,
      vertexShader: bokeh_shader.vertexShader,
      fragmentShader: bokeh_shader.fragmentShader,
      defines: {
        RINGS: this.shaderSettings.rings,
        SAMPLES: this.shaderSettings.samples,
        DEPTH_PACKING: 1
      }
    });
    this.postprocessing.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight), this.postprocessing.materialBokeh);
    this.postprocessing.quad.position.z = -500;
    this.postprocessing.scene.add(this.postprocessing.quad);
  }
};

CinematicCamera.prototype.renderCinematic = function (scene, renderer) {
  if (this.postprocessing.enabled) {
    var currentRenderTarget = renderer.getRenderTarget();
    renderer.clear();
    scene.overrideMaterial = null;
    renderer.setRenderTarget(this.postprocessing.rtTextureColor);
    renderer.clear();
    renderer.render(scene, this);
    scene.overrideMaterial = this.materialDepth;
    renderer.setRenderTarget(this.postprocessing.rtTextureDepth);
    renderer.clear();
    renderer.render(scene, this);
    renderer.setRenderTarget(null);
    renderer.render(this.postprocessing.scene, this.postprocessing.camera);
    renderer.setRenderTarget(currentRenderTarget);
  }
};