import {
	AddEquation,
	Color,
	CustomBlending,
	DepthTexture,
	DstAlphaFactor,
	DstColorFactor,
	HalfFloatType,
	MeshNormalMaterial,
	NearestFilter,
	NoBlending,
	ShaderMaterial,
	UniformsUtils,
	DepthStencilFormat,
	UnsignedInt248Type,
	Vector2,
	WebGLRenderTarget,
	ZeroFactor
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { SAOShader } from '../shaders/SAOShader.js';
import { DepthLimitedBlurShader } from '../shaders/DepthLimitedBlurShader.js';
import { BlurShaderUtils } from '../shaders/DepthLimitedBlurShader.js';
import { CopyShader } from '../shaders/CopyShader.js';

/**
 * SAO implementation inspired from bhouston previous SAO work
 */

class SAOPass extends Pass {

	constructor( scene, camera, resolution = new Vector2( 256, 256 ) ) {

		super();

		this.scene = scene;
		this.camera = camera;

		this.clear = true;
		this.needsSwap = false;

		this.originalClearColor = new Color();
		this._oldClearColor = new Color();
		this.oldClearAlpha = 1;

		this.params = {
			output: 0,
			saoBias: 0.5,
			saoIntensity: 0.18,
			saoScale: 1,
			saoKernelRadius: 100,
			saoMinResolution: 0,
			saoBlur: true,
			saoBlurRadius: 8,
			saoBlurStdDev: 4,
			saoBlurDepthCutoff: 0.01
		};

		this.resolution = new Vector2( resolution.x, resolution.y );

		this.saoRenderTarget = new WebGLRenderTarget( this.resolution.x, this.resolution.y, { type: HalfFloatType } );
		this.blurIntermediateRenderTarget = this.saoRenderTarget.clone();

		const depthTexture = new DepthTexture();
		depthTexture.format = DepthStencilFormat;
		depthTexture.type = UnsignedInt248Type;

		this.normalRenderTarget = new WebGLRenderTarget( this.resolution.x, this.resolution.y, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			type: HalfFloatType,
			depthTexture: depthTexture
		} );

		this.normalMaterial = new MeshNormalMaterial();
		this.normalMaterial.blending = NoBlending;

		this.saoMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, SAOShader.defines ),
			fragmentShader: SAOShader.fragmentShader,
			vertexShader: SAOShader.vertexShader,
			uniforms: UniformsUtils.clone( SAOShader.uniforms )
		} );
		this.saoMaterial.defines[ 'PERSPECTIVE_CAMERA' ] = this.camera.isPerspectiveCamera ? 1 : 0;
		this.saoMaterial.uniforms[ 'tDepth' ].value = depthTexture;
		this.saoMaterial.uniforms[ 'tNormal' ].value = this.normalRenderTarget.texture;
		this.saoMaterial.uniforms[ 'size' ].value.set( this.resolution.x, this.resolution.y );
		this.saoMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );
		this.saoMaterial.uniforms[ 'cameraProjectionMatrix' ].value = this.camera.projectionMatrix;
		this.saoMaterial.blending = NoBlending;

		this.vBlurMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( DepthLimitedBlurShader.uniforms ),
			defines: Object.assign( {}, DepthLimitedBlurShader.defines ),
			vertexShader: DepthLimitedBlurShader.vertexShader,
			fragmentShader: DepthLimitedBlurShader.fragmentShader
		} );
		this.vBlurMaterial.defines[ 'DEPTH_PACKING' ] = 0;
		this.vBlurMaterial.defines[ 'PERSPECTIVE_CAMERA' ] = this.camera.isPerspectiveCamera ? 1 : 0;
		this.vBlurMaterial.uniforms[ 'tDiffuse' ].value = this.saoRenderTarget.texture;
		this.vBlurMaterial.uniforms[ 'tDepth' ].value = depthTexture;
		this.vBlurMaterial.uniforms[ 'size' ].value.set( this.resolution.x, this.resolution.y );
		this.vBlurMaterial.blending = NoBlending;

		this.hBlurMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( DepthLimitedBlurShader.uniforms ),
			defines: Object.assign( {}, DepthLimitedBlurShader.defines ),
			vertexShader: DepthLimitedBlurShader.vertexShader,
			fragmentShader: DepthLimitedBlurShader.fragmentShader
		} );
		this.hBlurMaterial.defines[ 'DEPTH_PACKING' ] = 0;
		this.hBlurMaterial.defines[ 'PERSPECTIVE_CAMERA' ] = this.camera.isPerspectiveCamera ? 1 : 0;
		this.hBlurMaterial.uniforms[ 'tDiffuse' ].value = this.blurIntermediateRenderTarget.texture;
		this.hBlurMaterial.uniforms[ 'tDepth' ].value = depthTexture;
		this.hBlurMaterial.uniforms[ 'size' ].value.set( this.resolution.x, this.resolution.y );
		this.hBlurMaterial.blending = NoBlending;

		this.materialCopy = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( CopyShader.uniforms ),
			vertexShader: CopyShader.vertexShader,
			fragmentShader: CopyShader.fragmentShader,
			blending: NoBlending
		} );
		this.materialCopy.transparent = true;
		this.materialCopy.depthTest = false;
		this.materialCopy.depthWrite = false;
		this.materialCopy.blending = CustomBlending;
		this.materialCopy.blendSrc = DstColorFactor;
		this.materialCopy.blendDst = ZeroFactor;
		this.materialCopy.blendEquation = AddEquation;
		this.materialCopy.blendSrcAlpha = DstAlphaFactor;
		this.materialCopy.blendDstAlpha = ZeroFactor;
		this.materialCopy.blendEquationAlpha = AddEquation;

		this.fsQuad = new FullScreenQuad( null );

	}

	render( renderer, writeBuffer, readBuffer/*, deltaTime, maskActive*/ ) {

		// Rendering readBuffer first when rendering to screen
		if ( this.renderToScreen ) {

			this.materialCopy.blending = NoBlending;
			this.materialCopy.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
			this.materialCopy.needsUpdate = true;
			this.renderPass( renderer, this.materialCopy, null );

		}

		renderer.getClearColor( this._oldClearColor );
		this.oldClearAlpha = renderer.getClearAlpha();
		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.saoMaterial.uniforms[ 'bias' ].value = this.params.saoBias;
		this.saoMaterial.uniforms[ 'intensity' ].value = this.params.saoIntensity;
		this.saoMaterial.uniforms[ 'scale' ].value = this.params.saoScale;
		this.saoMaterial.uniforms[ 'kernelRadius' ].value = this.params.saoKernelRadius;
		this.saoMaterial.uniforms[ 'minResolution' ].value = this.params.saoMinResolution;
		this.saoMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.saoMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
		// this.saoMaterial.uniforms['randomSeed'].value = Math.random();

		const depthCutoff = this.params.saoBlurDepthCutoff * ( this.camera.far - this.camera.near );
		this.vBlurMaterial.uniforms[ 'depthCutoff' ].value = depthCutoff;
		this.hBlurMaterial.uniforms[ 'depthCutoff' ].value = depthCutoff;

		this.vBlurMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.vBlurMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
		this.hBlurMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.hBlurMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;

		this.params.saoBlurRadius = Math.floor( this.params.saoBlurRadius );
		if ( ( this.prevStdDev !== this.params.saoBlurStdDev ) || ( this.prevNumSamples !== this.params.saoBlurRadius ) ) {

			BlurShaderUtils.configure( this.vBlurMaterial, this.params.saoBlurRadius, this.params.saoBlurStdDev, new Vector2( 0, 1 ) );
			BlurShaderUtils.configure( this.hBlurMaterial, this.params.saoBlurRadius, this.params.saoBlurStdDev, new Vector2( 1, 0 ) );
			this.prevStdDev = this.params.saoBlurStdDev;
			this.prevNumSamples = this.params.saoBlurRadius;

		}

		// render normal and depth
		this.renderOverride( renderer, this.normalMaterial, this.normalRenderTarget, 0x7777ff, 1.0 );

		// Rendering SAO texture
		this.renderPass( renderer, this.saoMaterial, this.saoRenderTarget, 0xffffff, 1.0 );

		// Blurring SAO texture
		if ( this.params.saoBlur ) {

			this.renderPass( renderer, this.vBlurMaterial, this.blurIntermediateRenderTarget, 0xffffff, 1.0 );
			this.renderPass( renderer, this.hBlurMaterial, this.saoRenderTarget, 0xffffff, 1.0 );

		}

		const outputMaterial = this.materialCopy;

		// Setting up SAO rendering
		if ( this.params.output === SAOPass.OUTPUT.Normal ) {

			this.materialCopy.uniforms[ 'tDiffuse' ].value = this.normalRenderTarget.texture;
			this.materialCopy.needsUpdate = true;

		} else {

			this.materialCopy.uniforms[ 'tDiffuse' ].value = this.saoRenderTarget.texture;
			this.materialCopy.needsUpdate = true;

		}

		// Blending depends on output
		if ( this.params.output === SAOPass.OUTPUT.Default ) {

			outputMaterial.blending = CustomBlending;

		} else {

			outputMaterial.blending = NoBlending;

		}

		// Rendering SAOPass result on top of previous pass
		this.renderPass( renderer, outputMaterial, this.renderToScreen ? null : readBuffer );

		renderer.setClearColor( this._oldClearColor, this.oldClearAlpha );
		renderer.autoClear = oldAutoClear;

	}

	renderPass( renderer, passMaterial, renderTarget, clearColor, clearAlpha ) {

		// save original state
		renderer.getClearColor( this.originalClearColor );
		const originalClearAlpha = renderer.getClearAlpha();
		const originalAutoClear = renderer.autoClear;

		renderer.setRenderTarget( renderTarget );

		// setup pass state
		renderer.autoClear = false;
		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}

		this.fsQuad.material = passMaterial;
		this.fsQuad.render( renderer );

		// restore original state
		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	}

	renderOverride( renderer, overrideMaterial, renderTarget, clearColor, clearAlpha ) {

		renderer.getClearColor( this.originalClearColor );
		const originalClearAlpha = renderer.getClearAlpha();
		const originalAutoClear = renderer.autoClear;

		renderer.setRenderTarget( renderTarget );
		renderer.autoClear = false;

		clearColor = overrideMaterial.clearColor || clearColor;
		clearAlpha = overrideMaterial.clearAlpha || clearAlpha;
		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}

		this.scene.overrideMaterial = overrideMaterial;
		renderer.render( this.scene, this.camera );
		this.scene.overrideMaterial = null;

		// restore original state
		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	}

	setSize( width, height ) {

		this.saoRenderTarget.setSize( width, height );
		this.blurIntermediateRenderTarget.setSize( width, height );
		this.normalRenderTarget.setSize( width, height );

		this.saoMaterial.uniforms[ 'size' ].value.set( width, height );
		this.saoMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );
		this.saoMaterial.uniforms[ 'cameraProjectionMatrix' ].value = this.camera.projectionMatrix;
		this.saoMaterial.needsUpdate = true;

		this.vBlurMaterial.uniforms[ 'size' ].value.set( width, height );
		this.vBlurMaterial.needsUpdate = true;

		this.hBlurMaterial.uniforms[ 'size' ].value.set( width, height );
		this.hBlurMaterial.needsUpdate = true;

	}

	dispose() {

		this.saoRenderTarget.dispose();
		this.blurIntermediateRenderTarget.dispose();
		this.normalRenderTarget.dispose();

		this.normalMaterial.dispose();
		this.saoMaterial.dispose();
		this.vBlurMaterial.dispose();
		this.hBlurMaterial.dispose();
		this.materialCopy.dispose();

		this.fsQuad.dispose();

	}

}

SAOPass.OUTPUT = {
	'Default': 0,
	'SAO': 1,
	'Normal': 2
};

export { SAOPass };
