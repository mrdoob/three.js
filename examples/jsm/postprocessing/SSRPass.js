import {
  AddEquation,
  Color,
  CustomBlending,
  AdditiveBlending,
  DataTexture,
  DepthTexture,
  DstAlphaFactor,
  DstColorFactor,
  FloatType,
  LinearFilter,
  MathUtils,
  MeshNormalMaterial,
  NearestFilter,
  NoBlending,
  RGBAFormat,
  RepeatWrapping,
  ShaderMaterial,
  UniformsUtils,
  UnsignedShortType,
  Vector3,
  WebGLRenderTarget,
  ZeroFactor,
  MeshDepthMaterial,
  DoubleSide
} from "../../../build/three.module.js";
import { Pass } from "../postprocessing/Pass.js";
import { SimplexNoise } from "../math/SimplexNoise.js";
import { SSRShader } from "../shaders/SSRShader.js";
import { SSRBlurShader } from "../shaders/SSRShader.js";
import { CopyShader } from "../shaders/CopyShader.js";

var SSRPass = function(scene, camera, width, height, cameraRadius, cameraNear, cameraFar) {
  // console.log(cameraRadius, cameraNear, cameraFar)

  Pass.call(this);

  this.width = (width !== undefined) ? width : 512;
  this.height = (height !== undefined) ? height : 512;

  this.clear = true;

  this.camera = camera;
  this.scene = scene;

  // this.kernelRadius = 8;
  this.opacity = .5;
  this.kernelSize = 32;
  this.kernel = [];
  this.noiseTexture = null;
  this.output = 0;

  this.minDistance = 0.005;
  this.maxDistance = 1;

  //

  this.generateSampleKernel();
  this.generateRandomKernelRotations();

  this.beautyRenderTarget = new WebGLRenderTarget(this.width, this.height, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat,
  });

  // normal render target

  this.normalRenderTarget = new WebGLRenderTarget(this.width, this.height, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat
  });

  // depth render target

  this.depthRenderTarget = new WebGLRenderTarget(this.width, this.height, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat
  });

  // ssr render target

  this.ssrRenderTarget = new WebGLRenderTarget(this.width, this.height, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat
  });

  this.blurRenderTarget = this.ssrRenderTarget.clone();

  // ssr material

  if (SSRShader === undefined) {

    console.error('THREE.SSRPass: The pass relies on SSRShader.');

  }

  this.ssrMaterial = new ShaderMaterial({
    defines: Object.assign({}, SSRShader.defines),
    uniforms: UniformsUtils.clone(SSRShader.uniforms),
    vertexShader: SSRShader.vertexShader,
    fragmentShader: SSRShader.fragmentShader,
    blending: NoBlending
  });

  this.ssrMaterial.uniforms['tDiffuse'].value = this.beautyRenderTarget.texture;
  this.ssrMaterial.uniforms['tNormal'].value = this.normalRenderTarget.texture;
  this.ssrMaterial.uniforms['tDepth'].value = this.depthRenderTarget.texture;
  this.ssrMaterial.uniforms['tNoise'].value = this.noiseTexture;
  this.ssrMaterial.uniforms['kernel'].value = this.kernel;
  this.ssrMaterial.uniforms['cameraNear'].value = this.camera.near;
  this.ssrMaterial.uniforms['cameraFar'].value = this.camera.far;
  this.ssrMaterial.uniforms['resolution'].value.set(this.width, this.height);
  this.ssrMaterial.uniforms['cameraProjectionMatrix'].value.copy(this.camera.projectionMatrix);
  this.ssrMaterial.uniforms['cameraInverseProjectionMatrix'].value.getInverse(this.camera.projectionMatrix);
  this.ssrMaterial.uniforms['cameraNear2'].value = cameraNear
  this.ssrMaterial.uniforms['cameraRange'].value = cameraFar - cameraNear
  this.ssrMaterial.uniforms['UVWR'].value = cameraRadius * 2
  this.ssrMaterial.uniforms['MAX_STEP'].value = Math.sqrt(this.width * this.width + this.height * this.height)

  // normal material

  this.normalMaterial = new MeshNormalMaterial();
  this.normalMaterial.blending = NoBlending;

  // depth material

  this.depthMaterial = new MeshDepthMaterial();
  this.depthMaterial.blending = NoBlending;

  // blur material

  this.blurMaterial = new ShaderMaterial({
    defines: Object.assign({}, SSRBlurShader.defines),
    uniforms: UniformsUtils.clone(SSRBlurShader.uniforms),
    vertexShader: SSRBlurShader.vertexShader,
    fragmentShader: SSRBlurShader.fragmentShader
  });
  this.blurMaterial.uniforms['tDiffuse'].value = this.ssrRenderTarget.texture;
  this.blurMaterial.uniforms['resolution'].value.set(this.width, this.height);

  // material for rendering the content of a render target

  this.copyMaterial = new ShaderMaterial({
    uniforms: UniformsUtils.clone(CopyShader.uniforms),
    vertexShader: CopyShader.vertexShader,
    fragmentShader: CopyShader.fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blendSrc: DstColorFactor,
    blendDst: ZeroFactor,
    blendEquation: AddEquation,
    blendSrcAlpha: DstAlphaFactor,
    blendDstAlpha: ZeroFactor,
    blendEquationAlpha: AddEquation
  });

  this.fsQuad = new Pass.FullScreenQuad(null);

  this.originalClearColor = new Color();

};

SSRPass.prototype = Object.assign(Object.create(Pass.prototype), {

  constructor: SSRPass,

  dispose: function() {

    // dispose render targets

    this.beautyRenderTarget.dispose();
    this.normalRenderTarget.dispose();
    this.depthRenderTarget.dispose();
    this.ssrRenderTarget.dispose();
    this.blurRenderTarget.dispose();

    // dispose materials

    this.normalMaterial.dispose();
    this.depthMaterial.dispose();
    this.blurMaterial.dispose();
    this.copyMaterial.dispose();

    // dipsose full screen quad

    this.fsQuad.dispose();

  },

  render: function(renderer, writeBuffer /*, readBuffer, deltaTime, maskActive */ ) {

    // render beauty and depth

    renderer.setRenderTarget(this.beautyRenderTarget);
    renderer.clear();
    renderer.render(this.scene, this.camera);

    // render normals

    this.renderOverride(renderer, this.normalMaterial, this.normalRenderTarget, 0, 0);

    // render depths

    this.renderOverride(renderer, this.depthMaterial, this.depthRenderTarget, 0, 0);

    // render SSR

    // this.ssrMaterial.uniforms['kernelRadius'].value = this.kernelRadius;
    this.ssrMaterial.uniforms['opacity'].value = this.opacity;
    this.ssrMaterial.uniforms['minDistance'].value = this.minDistance;
    this.ssrMaterial.uniforms['maxDistance'].value = this.maxDistance;
    this.renderPass(renderer, this.ssrMaterial, this.ssrRenderTarget);

    // render blur

    this.blurMaterial.uniforms['opacity'].value = this.opacity;
    this.renderPass(renderer, this.blurMaterial, this.blurRenderTarget);

    // output result to screen

    switch (this.output) {

      case SSRPass.OUTPUT.SSR:

        this.copyMaterial.uniforms['tDiffuse'].value = this.ssrRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        break;

      case SSRPass.OUTPUT.Blur:

        this.copyMaterial.uniforms['tDiffuse'].value = this.blurRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        break;

      case SSRPass.OUTPUT.Beauty:

        this.copyMaterial.uniforms['tDiffuse'].value = this.beautyRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        break;

      case SSRPass.OUTPUT.Depth:

        this.copyMaterial.uniforms['tDiffuse'].value = this.depthRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        break;

      case SSRPass.OUTPUT.Normal:

        this.copyMaterial.uniforms['tDiffuse'].value = this.normalRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        break;

      case SSRPass.OUTPUT.Default:

        this.copyMaterial.uniforms['tDiffuse'].value = this.beautyRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        this.copyMaterial.uniforms['tDiffuse'].value = this.ssrRenderTarget.texture;
        this.copyMaterial.blending = AdditiveBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        break;

      case SSRPass.OUTPUT.DefaultBlur:

        this.copyMaterial.uniforms['tDiffuse'].value = this.beautyRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        this.copyMaterial.uniforms['tDiffuse'].value = this.blurRenderTarget.texture;
        this.copyMaterial.blending = AdditiveBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        break;

      default:
        console.warn('THREE.SSRPass: Unknown output type.');

    }

  },

  renderPass: function(renderer, passMaterial, renderTarget, clearColor, clearAlpha) {
    // clearColor = 'black'
    // clearAlpha = 1

    // save original state
    this.originalClearColor.copy(renderer.getClearColor());
    var originalClearAlpha = renderer.getClearAlpha();
    var originalAutoClear = renderer.autoClear;

    renderer.setRenderTarget(renderTarget);

    // setup pass state
    renderer.autoClear = false;
    if ((clearColor !== undefined) && (clearColor !== null)) {

      renderer.setClearColor(clearColor);
      renderer.setClearAlpha(clearAlpha || 0.0);
      renderer.clear();

    }

    this.fsQuad.material = passMaterial;
    this.fsQuad.render(renderer);

    // restore original state
    renderer.autoClear = originalAutoClear;
    renderer.setClearColor(this.originalClearColor);
    renderer.setClearAlpha(originalClearAlpha);

  },

  renderOverride: function(renderer, overrideMaterial, renderTarget, clearColor, clearAlpha) {
    // clearColor = 'black'
    // clearAlpha = 1

    this.originalClearColor.copy(renderer.getClearColor());
    var originalClearAlpha = renderer.getClearAlpha();
    var originalAutoClear = renderer.autoClear;

    renderer.setRenderTarget(renderTarget);
    renderer.autoClear = false;

    clearColor = overrideMaterial.clearColor || clearColor;
    clearAlpha = overrideMaterial.clearAlpha || clearAlpha;

    if ((clearColor !== undefined) && (clearColor !== null)) {

      renderer.setClearColor(clearColor);
      renderer.setClearAlpha(clearAlpha || 0.0);
      renderer.clear();

    }

    this.scene.overrideMaterial = overrideMaterial;
    renderer.render(this.scene, this.camera);
    this.scene.overrideMaterial = null;

    // restore original state

    renderer.autoClear = originalAutoClear;
    renderer.setClearColor(this.originalClearColor);
    renderer.setClearAlpha(originalClearAlpha);

  },

  setSize: function(width, height) {

    this.width = width;
    this.height = height;

    this.beautyRenderTarget.setSize(width, height);
    this.ssrRenderTarget.setSize(width, height);
    this.normalRenderTarget.setSize(width, height);
    this.blurRenderTarget.setSize(width, height);

    this.ssrMaterial.uniforms['resolution'].value.set(width, height);
    this.ssrMaterial.uniforms['MAX_STEP'].value = Math.sqrt(width * width + height * height)
    this.ssrMaterial.uniforms['cameraProjectionMatrix'].value.copy(this.camera.projectionMatrix);
    this.ssrMaterial.uniforms['cameraInverseProjectionMatrix'].value.getInverse(this.camera.projectionMatrix);

    this.blurMaterial.uniforms['resolution'].value.set(width, height);

  },

  generateSampleKernel: function() {

    var kernelSize = this.kernelSize;
    var kernel = this.kernel;

    for (var i = 0; i < kernelSize; i++) {

      var sample = new Vector3();
      sample.x = (Math.random() * 2) - 1;
      sample.y = (Math.random() * 2) - 1;
      sample.z = Math.random();

      sample.normalize();

      var scale = i / kernelSize;
      scale = MathUtils.lerp(0.1, 1, scale * scale);
      sample.multiplyScalar(scale);

      kernel.push(sample);

    }

  },

  generateRandomKernelRotations: function() {

    var width = 4,
      height = 4;

    if (SimplexNoise === undefined) {

      console.error('THREE.SSRPass: The pass relies on SimplexNoise.');

    }

    var simplex = new SimplexNoise();

    var size = width * height;
    var data = new Float32Array(size * 4);

    for (var i = 0; i < size; i++) {

      var stride = i * 4;

      var x = (Math.random() * 2) - 1;
      var y = (Math.random() * 2) - 1;
      var z = 0;

      var noise = simplex.noise3d(x, y, z);

      data[stride] = noise;
      data[stride + 1] = noise;
      data[stride + 2] = noise;
      data[stride + 3] = 1;

    }

    this.noiseTexture = new DataTexture(data, width, height, RGBAFormat, FloatType);
    this.noiseTexture.wrapS = RepeatWrapping;
    this.noiseTexture.wrapT = RepeatWrapping;

  }

});

SSRPass.OUTPUT = {
  'Default': 0,
  'SSR': 1,
  'Blur': 2,
  'Beauty': 3,
  'Depth': 4,
  'Normal': 5,
  'DefaultBlur': 6
};

export { SSRPass };
