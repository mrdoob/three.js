import {
  AddEquation,
  Color,
  AdditiveBlending,
	DepthTexture,
  DstAlphaFactor,
  DstColorFactor,
  LinearFilter,
  MathUtils,
  MeshNormalMaterial,
  NearestFilter,
  NoBlending,
  RGBAFormat,
  ShaderMaterial,
  UniformsUtils,
	UnsignedShortType,
  Vector3,
  WebGLRenderTarget,
  ZeroFactor,
  MeshDepthMaterial,
} from "../../../build/three.module.js";
import { Pass } from "../postprocessing/Pass.js";
import { OrthographicSSRShader } from "../shaders/OrthographicSSRShader.js";
import { OrthographicSSRBlurShader } from "../shaders/OrthographicSSRShader.js";
import { OrthographicSSRDepthShader } from "../shaders/OrthographicSSRShader.js";
import { CopyShader } from "../shaders/CopyShader.js";

var OrthographicSSRPass = function(scene, camera, width, height, frustumSize) {

  Pass.call(this);

  this.width = (width !== undefined) ? width : 512;
  this.height = (height !== undefined) ? height : 512;
  this.frustumSize = frustumSize

  this.clear = true;

  this.camera = camera;
  this.scene = scene;

  this.opacity = .5;
  this.output = 6;

  this.minDistance = 0.005;
  this.maxDistance = 1;
  // this.stepStride = 1;
  this.surfDist = 1;
  this.isFade = true;
  this.fadeIntensity = 1.5;

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

  // orthographicSSR render target

  this.orthographicSSRRenderTarget = new WebGLRenderTarget(this.width, this.height, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat
  });

  this.blurRenderTarget = this.orthographicSSRRenderTarget.clone();

  // orthographicSSR material

  if (OrthographicSSRShader === undefined) {

    console.error('THREE.OrthographicSSRPass: The pass relies on OrthographicSSRShader.');

  }

  OrthographicSSRShader.fragmentShader = OrthographicSSRShader.fragmentShader.replace(/#define MAX_STEP .*/, `#define MAX_STEP ${Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight)}`)
  this.orthographicSSRMaterial = new ShaderMaterial({
    defines: Object.assign({}, OrthographicSSRShader.defines),
    uniforms: UniformsUtils.clone(OrthographicSSRShader.uniforms),
    vertexShader: OrthographicSSRShader.vertexShader,
    fragmentShader: OrthographicSSRShader.fragmentShader,
    blending: NoBlending
  });

  this.orthographicSSRMaterial.uniforms['tDiffuse'].value = this.beautyRenderTarget.texture;
  this.orthographicSSRMaterial.uniforms['tNormal'].value = this.normalRenderTarget.texture;
  this.orthographicSSRMaterial.uniforms['tDepth'].value = this.beautyRenderTarget.depthTexture;
  this.orthographicSSRMaterial.uniforms['cameraNear'].value = this.camera.near;
  this.orthographicSSRMaterial.uniforms['cameraFar'].value = this.camera.far;
  this.orthographicSSRMaterial.uniforms['resolution'].value.set(this.width, this.height);
  this.orthographicSSRMaterial.uniforms['cameraProjectionMatrix'].value.copy(this.camera.projectionMatrix);
  this.orthographicSSRMaterial.uniforms['cameraInverseProjectionMatrix'].value.getInverse(this.camera.projectionMatrix);
  this.orthographicSSRMaterial.uniforms['cameraRange'].value = this.camera.far; - this.camera.near;
  this.orthographicSSRMaterial.uniforms['frustumSize'].value = this.frustumSize

  // normal material

  this.normalMaterial = new MeshNormalMaterial();
  this.normalMaterial.blending = NoBlending;

  // blur material

  this.blurMaterial = new ShaderMaterial({
    defines: Object.assign({}, OrthographicSSRBlurShader.defines),
    uniforms: UniformsUtils.clone(OrthographicSSRBlurShader.uniforms),
    vertexShader: OrthographicSSRBlurShader.vertexShader,
    fragmentShader: OrthographicSSRBlurShader.fragmentShader
  });
  this.blurMaterial.uniforms['tDiffuse'].value = this.orthographicSSRRenderTarget.texture;
  this.blurMaterial.uniforms['resolution'].value.set(this.width, this.height);

	// material for rendering the depth

	this.depthRenderMaterial = new ShaderMaterial( {
		defines: Object.assign( {}, OrthographicSSRDepthShader.defines ),
		uniforms: UniformsUtils.clone( OrthographicSSRDepthShader.uniforms ),
		vertexShader: OrthographicSSRDepthShader.vertexShader,
		fragmentShader: OrthographicSSRDepthShader.fragmentShader,
		blending: NoBlending
	} );
	this.depthRenderMaterial.uniforms[ 'tDepth' ].value = this.beautyRenderTarget.depthTexture;
	this.depthRenderMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
	this.depthRenderMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;

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

OrthographicSSRPass.prototype = Object.assign(Object.create(Pass.prototype), {

  constructor: OrthographicSSRPass,

  dispose: function() {

    // dispose render targets

    this.beautyRenderTarget.dispose();
    this.normalRenderTarget.dispose();
    this.orthographicSSRRenderTarget.dispose();
    this.blurRenderTarget.dispose();

    // dispose materials

    this.normalMaterial.dispose();
    this.blurMaterial.dispose();
    this.copyMaterial.dispose();
		this.depthRenderMaterial.dispose();

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

    // render OrthographicSSR

    this.orthographicSSRMaterial.uniforms['opacity'].value = this.opacity;
    this.orthographicSSRMaterial.uniforms['minDistance'].value = this.minDistance;
    this.orthographicSSRMaterial.uniforms['maxDistance'].value = this.maxDistance;
    // this.orthographicSSRMaterial.uniforms['stepStride'].value = this.stepStride;
    this.orthographicSSRMaterial.uniforms['surfDist'].value = this.surfDist / this.frustumSize;
    this.orthographicSSRMaterial.uniforms['isFade'].value = this.isFade;
    this.orthographicSSRMaterial.uniforms['fadeIntensity'].value = this.fadeIntensity;
    this.renderPass(renderer, this.orthographicSSRMaterial, this.orthographicSSRRenderTarget);

    // render blur

    this.blurMaterial.uniforms['opacity'].value = this.opacity;
    this.renderPass(renderer, this.blurMaterial, this.blurRenderTarget);

    // output result to screen

    switch (this.output) {

      case OrthographicSSRPass.OUTPUT.OrthographicSSR:

        this.copyMaterial.uniforms['tDiffuse'].value = this.orthographicSSRRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        break;

      case OrthographicSSRPass.OUTPUT.Blur:

        this.copyMaterial.uniforms['tDiffuse'].value = this.blurRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        break;

      case OrthographicSSRPass.OUTPUT.Beauty:

        this.copyMaterial.uniforms['tDiffuse'].value = this.beautyRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        break;

			case OrthographicSSRPass.OUTPUT.Depth:

				this.renderPass( renderer, this.depthRenderMaterial, this.renderToScreen ? null : writeBuffer );

				break;

      case OrthographicSSRPass.OUTPUT.Normal:

        this.copyMaterial.uniforms['tDiffuse'].value = this.normalRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        break;

      case OrthographicSSRPass.OUTPUT.Default:

        this.copyMaterial.uniforms['tDiffuse'].value = this.beautyRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        this.copyMaterial.uniforms['tDiffuse'].value = this.orthographicSSRRenderTarget.texture;
        this.copyMaterial.blending = AdditiveBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        break;

      case OrthographicSSRPass.OUTPUT.DefaultBlur:

        this.copyMaterial.uniforms['tDiffuse'].value = this.beautyRenderTarget.texture;
        this.copyMaterial.blending = NoBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        this.copyMaterial.uniforms['tDiffuse'].value = this.blurRenderTarget.texture;
        this.copyMaterial.blending = AdditiveBlending;
        this.renderPass(renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer);

        break;

      default:
        console.warn('THREE.OrthographicSSRPass: Unknown output type.');

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

  setSize: function(width, height) {

    this.width = width;
    this.height = height;

    this.orthographicSSRMaterial.fragmentShader = this.orthographicSSRMaterial.fragmentShader = OrthographicSSRShader.fragmentShader.replace(/#define MAX_STEP .*/, `#define MAX_STEP ${Math.sqrt(width * width + height * height)}`)
    this.orthographicSSRMaterial.needsUpdate = true

    this.beautyRenderTarget.setSize(width, height);
    this.orthographicSSRRenderTarget.setSize(width, height);
    this.normalRenderTarget.setSize(width, height);
    this.blurRenderTarget.setSize(width, height);

    this.orthographicSSRMaterial.uniforms['resolution'].value.set(width, height);
    this.orthographicSSRMaterial.uniforms['cameraProjectionMatrix'].value.copy(this.camera.projectionMatrix);
    this.orthographicSSRMaterial.uniforms['cameraInverseProjectionMatrix'].value.getInverse(this.camera.projectionMatrix);

    this.blurMaterial.uniforms['resolution'].value.set(width, height);

  },

  setFrustumSize: function(frustumSize) {
    this.frustumSize = frustumSize
    this.orthographicSSRMaterial.uniforms['frustumSize'].value = this.frustumSize
  }

});

OrthographicSSRPass.OUTPUT = {
  'Default': 0,
  'OrthographicSSR': 1,
  'Blur': 2,
  'Beauty': 3,
  'Depth': 4,
  'Normal': 5,
  'DefaultBlur': 6
};

export { OrthographicSSRPass };
