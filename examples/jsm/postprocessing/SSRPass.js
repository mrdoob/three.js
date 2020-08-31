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
  MeshBasicMaterial,
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
import { SSRShader } from "../shaders/SSRShader.js";
import { SSRBlurShader } from "../shaders/SSRShader.js";
import { SSRDepthShader } from "../shaders/SSRShader.js";
import { CopyShader } from "../shaders/CopyShader.js";

var SSRPass = function({ scene, camera, width, height, selects, encoding, isPerspectiveCamera = true }) {

  Pass.call(this);

  this.width = (width !== undefined) ? width : 512;
  this.height = (height !== undefined) ? height : 512;

  this.clear = true;

  this.camera = camera;
  this.scene = scene;

  this.opacity = .5;
  this.output = 6;

  this.maxDistance = 900;
  this.surfDist = 1.

  this.selects = selects
  this.isSelective = Array.isArray(this.selects)

  this.encoding = encoding

  // beauty render target with depth buffer

  var depthTexture = new DepthTexture();
  depthTexture.type = UnsignedShortType;
  depthTexture.minFilter = NearestFilter;
  depthTexture.maxFilter = NearestFilter;

  this.beautyRenderTarget = new WebGLRenderTarget(this.width, this.height, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat,
    depthTexture: depthTexture,
    depthBuffer: true
  });

  // normal render target

  this.normalRenderTarget = new WebGLRenderTarget(this.width, this.height, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat
  });

  // metalness render target

  if (this.isSelective) {
    this.metalnessRenderTarget = new WebGLRenderTarget(this.width, this.height, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      format: RGBAFormat
    });
  }



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

  SSRShader.fragmentShader = SSRShader.fragmentShader.replace(/#define MAX_STEP .*/, `#define MAX_STEP ${Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight)}`)
  this.ssrMaterial = new ShaderMaterial({
    defines: Object.assign({}, SSRShader.defines),
    uniforms: UniformsUtils.clone(SSRShader.uniforms),
    vertexShader: SSRShader.vertexShader,
    fragmentShader: SSRShader.fragmentShader,
    blending: NoBlending
  });

  this.ssrMaterial.uniforms['tDiffuse'].value = this.beautyRenderTarget.texture;
  this.ssrMaterial.uniforms['tNormal'].value = this.normalRenderTarget.texture;
  if (this.isSelective) {
    this.ssrMaterial.uniforms['isSelective'].value = true;
    this.ssrMaterial.uniforms['tMetalness'].value = this.metalnessRenderTarget.texture;
  }
  this.ssrMaterial.uniforms['tDepth'].value = this.beautyRenderTarget.depthTexture;
  this.ssrMaterial.uniforms['cameraNear'].value = this.camera.near;
  this.ssrMaterial.uniforms['cameraFar'].value = this.camera.far;
  this.ssrMaterial.uniforms['surfDist'].value = this.surfDist;
  this.ssrMaterial.uniforms['resolution'].value.set(this.width, this.height);
  this.ssrMaterial.uniforms['cameraProjectionMatrix'].value.copy(this.camera.projectionMatrix);
  this.ssrMaterial.uniforms['cameraInverseProjectionMatrix'].value.getInverse(this.camera.projectionMatrix);
  this.ssrMaterial.uniforms['isPerspectiveCamera'].value = isPerspectiveCamera

  // normal material

  this.normalMaterial = new MeshNormalMaterial();
  this.normalMaterial.blending = NoBlending;

  if (this.isSelective) {
    // metalnessOn material

    this.metalnessOnMaterial = new MeshBasicMaterial({
      color: 'white'
    });

    // metalnessOff material

    this.metalnessOffMaterial = new MeshBasicMaterial({
      color: 'black'
    });
  }



  // blur material

  this.blurMaterial = new ShaderMaterial({
    defines: Object.assign({}, SSRBlurShader.defines),
    uniforms: UniformsUtils.clone(SSRBlurShader.uniforms),
    vertexShader: SSRBlurShader.vertexShader,
    fragmentShader: SSRBlurShader.fragmentShader
  });
  this.blurMaterial.uniforms['tDiffuse'].value = this.ssrRenderTarget.texture;
  this.blurMaterial.uniforms['resolution'].value.set(this.width, this.height);
  // material for rendering the depth

  this.depthRenderMaterial = new ShaderMaterial({
    defines: Object.assign({}, SSRDepthShader.defines),
    uniforms: UniformsUtils.clone(SSRDepthShader.uniforms),
    vertexShader: SSRDepthShader.vertexShader,
    fragmentShader: SSRDepthShader.fragmentShader,
    blending: NoBlending
  });
  this.depthRenderMaterial.uniforms['tDepth'].value = this.beautyRenderTarget.depthTexture;
  this.depthRenderMaterial.uniforms['cameraNear'].value = this.camera.near;
  this.depthRenderMaterial.uniforms['cameraFar'].value = this.camera.far;

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
    if (this.isSelective) this.metalnessRenderTarget.dispose();
    this.ssrRenderTarget.dispose();
    this.blurRenderTarget.dispose();

    // dispose materials

    this.normalMaterial.dispose();
    if (this.isSelective) {
      this.metalnessOnMaterial.dispose();
      this.metalnessOffMaterial.dispose();
    }
    this.blurMaterial.dispose();
    this.copyMaterial.dispose();
    this.depthRenderMaterial.dispose();

    // dipsose full screen quad

    this.fsQuad.dispose();

  },

  render: function(renderer, writeBuffer /*, readBuffer, deltaTime, maskActive */ ) {

    // render beauty and depth

    if (this.encoding) this.beautyRenderTarget.texture.encoding = this.encoding
    renderer.setRenderTarget(this.beautyRenderTarget);
    renderer.clear();
    renderer.render(this.scene, this.camera);

    // render normals

    this.renderOverride(renderer, this.normalMaterial, this.normalRenderTarget, 0, 0);

    // render metalnesses

    if (this.isSelective) {
      this.renderMetalness(renderer, this.metalnessOnMaterial, this.metalnessRenderTarget, 0, 0);
    }

    // render SSR

    this.ssrMaterial.uniforms['opacity'].value = this.opacity;
    this.ssrMaterial.uniforms['maxDistance'].value = this.maxDistance;
    this.ssrMaterial.uniforms['surfDist'].value = this.surfDist;
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

        this.renderPass(renderer, this.depthRenderMaterial, this.renderToScreen ? null : writeBuffer);

        break;

      case SSRPass.OUTPUT.Normal:

        this.copyMaterial.uniforms['tDiffuse'].value = this.normalRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        break;

      case SSRPass.OUTPUT.Metalness:

        this.copyMaterial.uniforms['tDiffuse'].value = this.metalnessRenderTarget.texture;
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

  renderMetalness: function(renderer, overrideMaterial, renderTarget, clearColor, clearAlpha) {

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

    this.scene.traverse(child => {
      child._SSRPassMaterialBack = child.material
      if (this.selects.includes(child)) {
        child.material = this.metalnessOnMaterial
      } else {
        child.material = this.metalnessOffMaterial
      }
    })
    renderer.render(this.scene, this.camera);
    this.scene.traverse(child => {
      child.material = child._SSRPassMaterialBack
    })

    // restore original state

    renderer.autoClear = originalAutoClear;
    renderer.setClearColor(this.originalClearColor);
    renderer.setClearAlpha(originalClearAlpha);

  },

  setSize: function(width, height) {

    this.width = width;
    this.height = height;

    this.ssrMaterial.fragmentShader = this.ssrMaterial.fragmentShader = SSRShader.fragmentShader.replace(/#define MAX_STEP .*/, `#define MAX_STEP ${Math.sqrt(width * width + height * height)}`)
    this.ssrMaterial.needsUpdate = true
    this.beautyRenderTarget.setSize(width, height);
    this.ssrRenderTarget.setSize(width, height);
    this.normalRenderTarget.setSize(width, height);
    if (this.isSelective) this.metalnessRenderTarget.setSize(width, height);
    this.blurRenderTarget.setSize(width, height);

    this.ssrMaterial.uniforms['resolution'].value.set(width, height);
    this.ssrMaterial.uniforms['cameraProjectionMatrix'].value.copy(this.camera.projectionMatrix);
    this.ssrMaterial.uniforms['cameraInverseProjectionMatrix'].value.getInverse(this.camera.projectionMatrix);

    this.blurMaterial.uniforms['resolution'].value.set(width, height);

  },

});

SSRPass.OUTPUT = {
  'Default': 0,
  'DefaultBlur': 6,
  'SSR': 1,
  'Blur': 2,
  'Beauty': 3,
  'Depth': 4,
  'Normal': 5,
  'Metalness': 7,
};

export { SSRPass };
