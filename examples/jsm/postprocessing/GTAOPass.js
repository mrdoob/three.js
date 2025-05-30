import {
	AddEquation,
	Color,
	CustomBlending,
	DataTexture,
	DepthTexture,
	DepthStencilFormat,
	DstAlphaFactor,
	DstColorFactor,
	HalfFloatType,
	MeshNormalMaterial,
	NearestFilter,
	NoBlending,
	RepeatWrapping,
	RGBAFormat,
	ShaderMaterial,
	UniformsUtils,
	UnsignedByteType,
	UnsignedInt248Type,
	WebGLRenderTarget,
	ZeroFactor
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { generateMagicSquareNoise, GTAOShader, GTAODepthShader, GTAOBlendShader } from '../shaders/GTAOShader.js';
import { generatePdSamplePointInitializer, PoissonDenoiseShader } from '../shaders/PoissonDenoiseShader.js';
import { CopyShader } from '../shaders/CopyShader.js';
import { SimplexNoise } from '../math/SimplexNoise.js';

/**
 * A pass for an GTAO effect.
 *
 * `GTAOPass` provides better quality than {@link SSAOPass} but is also more expensive.
 *
 * ```js
 * const gtaoPass = new GTAOPass( scene, camera, width, height );
 * gtaoPass.output = GTAOPass.OUTPUT.Denoise;
 * composer.addPass( gtaoPass );
 * ```
 *
 * @augments Pass
 * @three_import import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
 */
class GTAOPass extends Pass {

	/**
	 * Constructs a new GTAO pass.
	 *
	 * @param {Scene} scene - The scene to compute the AO for.
	 * @param {Camera} camera - The camera.
	 * @param {number} [width=512] - The width of the effect.
	 * @param {number} [height=512] - The height of the effect.
	 * @param {Object} [parameters] - The pass parameters.
	 * @param {Object} [aoParameters] - The AO parameters.
	 * @param {Object} [pdParameters] - The denoise parameters.
	 */
	constructor( scene, camera, width = 512, height = 512, parameters, aoParameters, pdParameters ) {

		super();

		/**
		 * The width of the effect.
		 *
		 * @type {number}
		 * @default 512
		 */
		this.width = width;

		/**
		 * The height of the effect.
		 *
		 * @type {number}
		 * @default 512
		 */
		this.height = height;

		/**
		 * Overwritten to perform a clear operation by default.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.clear = true;

		/**
		 * The camera.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;

		/**
		 * The scene to render the AO for.
		 *
		 * @type {Scene}
		 */
		this.scene = scene;

		/**
		 * The output configuration.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.output = 0;
		this._renderGBuffer = true;
		this._visibilityCache = new Map();

		/**
		 * The AO blend intensity.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.blendIntensity = 1.;

		/**
		 * The number of Poisson Denoise rings.
		 *
		 * @type {number}
		 * @default 2
		 */
		this.pdRings = 2.;

		/**
		 * The Poisson Denoise radius exponent.
		 *
		 * @type {number}
		 * @default 2
		 */
		this.pdRadiusExponent = 2.;

		/**
		 * The Poisson Denoise sample count.
		 *
		 * @type {number}
		 * @default 16
		 */
		this.pdSamples = 16;

		this.gtaoNoiseTexture = generateMagicSquareNoise();
		this.pdNoiseTexture = this._generateNoise();

		this.gtaoRenderTarget = new WebGLRenderTarget( this.width, this.height, { type: HalfFloatType } );
		this.pdRenderTarget = this.gtaoRenderTarget.clone();

		this.gtaoMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, GTAOShader.defines ),
			uniforms: UniformsUtils.clone( GTAOShader.uniforms ),
			vertexShader: GTAOShader.vertexShader,
			fragmentShader: GTAOShader.fragmentShader,
			blending: NoBlending,
			depthTest: false,
			depthWrite: false,
		} );
		this.gtaoMaterial.defines.PERSPECTIVE_CAMERA = this.camera.isPerspectiveCamera ? 1 : 0;
		this.gtaoMaterial.uniforms.tNoise.value = this.gtaoNoiseTexture;
		this.gtaoMaterial.uniforms.resolution.value.set( this.width, this.height );
		this.gtaoMaterial.uniforms.cameraNear.value = this.camera.near;
		this.gtaoMaterial.uniforms.cameraFar.value = this.camera.far;

		this.normalMaterial = new MeshNormalMaterial();
		this.normalMaterial.blending = NoBlending;

		this.pdMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, PoissonDenoiseShader.defines ),
			uniforms: UniformsUtils.clone( PoissonDenoiseShader.uniforms ),
			vertexShader: PoissonDenoiseShader.vertexShader,
			fragmentShader: PoissonDenoiseShader.fragmentShader,
			depthTest: false,
			depthWrite: false,
		} );
		this.pdMaterial.uniforms.tDiffuse.value = this.gtaoRenderTarget.texture;
		this.pdMaterial.uniforms.tNoise.value = this.pdNoiseTexture;
		this.pdMaterial.uniforms.resolution.value.set( this.width, this.height );
		this.pdMaterial.uniforms.lumaPhi.value = 10;
		this.pdMaterial.uniforms.depthPhi.value = 2;
		this.pdMaterial.uniforms.normalPhi.value = 3;
		this.pdMaterial.uniforms.radius.value = 8;

		this.depthRenderMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, GTAODepthShader.defines ),
			uniforms: UniformsUtils.clone( GTAODepthShader.uniforms ),
			vertexShader: GTAODepthShader.vertexShader,
			fragmentShader: GTAODepthShader.fragmentShader,
			blending: NoBlending
		} );
		this.depthRenderMaterial.uniforms.cameraNear.value = this.camera.near;
		this.depthRenderMaterial.uniforms.cameraFar.value = this.camera.far;

		this.copyMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( CopyShader.uniforms ),
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
		} );

		this.blendMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( GTAOBlendShader.uniforms ),
			vertexShader: GTAOBlendShader.vertexShader,
			fragmentShader: GTAOBlendShader.fragmentShader,
			transparent: true,
			depthTest: false,
			depthWrite: false,
			blending: CustomBlending,
			blendSrc: DstColorFactor,
			blendDst: ZeroFactor,
			blendEquation: AddEquation,
			blendSrcAlpha: DstAlphaFactor,
			blendDstAlpha: ZeroFactor,
			blendEquationAlpha: AddEquation
		} );

		this._fsQuad = new FullScreenQuad( null );

		this._originalClearColor = new Color();

		this.setGBuffer( parameters ? parameters.depthTexture : undefined, parameters ? parameters.normalTexture : undefined );

		if ( aoParameters !== undefined ) {

			this.updateGtaoMaterial( aoParameters );

		}

		if ( pdParameters !== undefined ) {

			this.updatePdMaterial( pdParameters );

		}

	}

	/**
	 * Sets the size of the pass.
	 *
	 * @param {number} width - The width to set.
	 * @param {number} height - The height to set.
	 */
	setSize( width, height ) {

		this.width = width;
		this.height = height;

		this.gtaoRenderTarget.setSize( width, height );
		this.normalRenderTarget.setSize( width, height );
		this.pdRenderTarget.setSize( width, height );

		this.gtaoMaterial.uniforms.resolution.value.set( width, height );
		this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy( this.camera.projectionMatrix );
		this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy( this.camera.projectionMatrixInverse );

		this.pdMaterial.uniforms.resolution.value.set( width, height );
		this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy( this.camera.projectionMatrixInverse );

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever the pass is no longer used in your app.
	 */
	dispose() {

		this.gtaoNoiseTexture.dispose();
		this.pdNoiseTexture.dispose();
		this.normalRenderTarget.dispose();
		this.gtaoRenderTarget.dispose();
		this.pdRenderTarget.dispose();
		this.normalMaterial.dispose();
		this.pdMaterial.dispose();
		this.copyMaterial.dispose();
		this.depthRenderMaterial.dispose();
		this._fsQuad.dispose();

	}

	/**
	 * A texture holding the computed AO.
	 *
	 * @type {Texture}
	 * @readonly
	 */
	get gtaoMap() {

		return this.pdRenderTarget.texture;

	}

	/**
	 * Configures the GBuffer of this pass. If no arguments are passed,
	 * the pass creates an internal render target for holding depth
	 * and normal data.
	 *
	 * @param {DepthTexture} [depthTexture] - The depth texture.
	 * @param {DepthTexture} [normalTexture] - The normal texture.
	 */
	setGBuffer( depthTexture, normalTexture ) {

		if ( depthTexture !== undefined ) {

			this.depthTexture = depthTexture;
			this.normalTexture = normalTexture;
			this._renderGBuffer = false;

		} else {

			this.depthTexture = new DepthTexture();
			this.depthTexture.format = DepthStencilFormat;
			this.depthTexture.type = UnsignedInt248Type;
			this.normalRenderTarget = new WebGLRenderTarget( this.width, this.height, {
				minFilter: NearestFilter,
				magFilter: NearestFilter,
				type: HalfFloatType,
				depthTexture: this.depthTexture
			} );
			this.normalTexture = this.normalRenderTarget.texture;
			this._renderGBuffer = true;

		}

		const normalVectorType = ( this.normalTexture ) ? 1 : 0;
		const depthValueSource = ( this.depthTexture === this.normalTexture ) ? 'w' : 'x';

		this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE = normalVectorType;
		this.gtaoMaterial.defines.DEPTH_SWIZZLING = depthValueSource;
		this.gtaoMaterial.uniforms.tNormal.value = this.normalTexture;
		this.gtaoMaterial.uniforms.tDepth.value = this.depthTexture;

		this.pdMaterial.defines.NORMAL_VECTOR_TYPE = normalVectorType;
		this.pdMaterial.defines.DEPTH_SWIZZLING = depthValueSource;
		this.pdMaterial.uniforms.tNormal.value = this.normalTexture;
		this.pdMaterial.uniforms.tDepth.value = this.depthTexture;

		this.depthRenderMaterial.uniforms.tDepth.value = this.normalRenderTarget.depthTexture;

	}

	/**
	 * Configures the clip box of the GTAO shader with the given AABB.
	 *
	 * @param {?Box3} box - The AABB enclosing the scene that should receive AO. When passing
	 * `null`, to clip box is used.
	 */
	setSceneClipBox( box ) {

		if ( box ) {

			this.gtaoMaterial.needsUpdate = this.gtaoMaterial.defines.SCENE_CLIP_BOX !== 1;
			this.gtaoMaterial.defines.SCENE_CLIP_BOX = 1;
			this.gtaoMaterial.uniforms.sceneBoxMin.value.copy( box.min );
			this.gtaoMaterial.uniforms.sceneBoxMax.value.copy( box.max );

		} else {

			this.gtaoMaterial.needsUpdate = this.gtaoMaterial.defines.SCENE_CLIP_BOX === 0;
			this.gtaoMaterial.defines.SCENE_CLIP_BOX = 0;

		}

	}

	/**
	 * Updates the GTAO material from the given parameter object.
	 *
	 * @param {Object} parameters - The GTAO material parameters.
	 */
	updateGtaoMaterial( parameters ) {

		if ( parameters.radius !== undefined ) {

			this.gtaoMaterial.uniforms.radius.value = parameters.radius;

		}

		if ( parameters.distanceExponent !== undefined ) {

			this.gtaoMaterial.uniforms.distanceExponent.value = parameters.distanceExponent;

		}

		if ( parameters.thickness !== undefined ) {

			this.gtaoMaterial.uniforms.thickness.value = parameters.thickness;

		}

		if ( parameters.distanceFallOff !== undefined ) {

			this.gtaoMaterial.uniforms.distanceFallOff.value = parameters.distanceFallOff;
			this.gtaoMaterial.needsUpdate = true;

		}

		if ( parameters.scale !== undefined ) {

			this.gtaoMaterial.uniforms.scale.value = parameters.scale;

		}

		if ( parameters.samples !== undefined && parameters.samples !== this.gtaoMaterial.defines.SAMPLES ) {

			this.gtaoMaterial.defines.SAMPLES = parameters.samples;
			this.gtaoMaterial.needsUpdate = true;

		}

		if ( parameters.screenSpaceRadius !== undefined && ( parameters.screenSpaceRadius ? 1 : 0 ) !== this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS ) {

			this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS = parameters.screenSpaceRadius ? 1 : 0;
			this.gtaoMaterial.needsUpdate = true;

		}

	}

	/**
	 * Updates the Denoise material from the given parameter object.
	 *
	 * @param {Object} parameters - The denoise parameters.
	 */
	updatePdMaterial( parameters ) {

		let updateShader = false;

		if ( parameters.lumaPhi !== undefined ) {

			this.pdMaterial.uniforms.lumaPhi.value = parameters.lumaPhi;

		}

		if ( parameters.depthPhi !== undefined ) {

			this.pdMaterial.uniforms.depthPhi.value = parameters.depthPhi;

		}

		if ( parameters.normalPhi !== undefined ) {

			this.pdMaterial.uniforms.normalPhi.value = parameters.normalPhi;

		}

		if ( parameters.radius !== undefined && parameters.radius !== this.radius ) {

			this.pdMaterial.uniforms.radius.value = parameters.radius;

		}

		if ( parameters.radiusExponent !== undefined && parameters.radiusExponent !== this.pdRadiusExponent ) {

			this.pdRadiusExponent = parameters.radiusExponent;
			updateShader = true;

		}

		if ( parameters.rings !== undefined && parameters.rings !== this.pdRings ) {

			this.pdRings = parameters.rings;
			updateShader = true;

		}

		if ( parameters.samples !== undefined && parameters.samples !== this.pdSamples ) {

			this.pdSamples = parameters.samples;
			updateShader = true;

		}

		if ( updateShader ) {

			this.pdMaterial.defines.SAMPLES = this.pdSamples;
			this.pdMaterial.defines.SAMPLE_VECTORS = generatePdSamplePointInitializer( this.pdSamples, this.pdRings, this.pdRadiusExponent );
			this.pdMaterial.needsUpdate = true;

		}

	}

	/**
	 * Performs the GTAO pass.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
	 * destination for the pass.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
	 * previous pass from this buffer.
	 * @param {number} deltaTime - The delta time in seconds.
	 * @param {boolean} maskActive - Whether masking is active or not.
	 */
	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		// render normals and depth (honor only meshes, points and lines do not contribute to AO)

		if ( this._renderGBuffer ) {

			this._overrideVisibility();
			this._renderOverride( renderer, this.normalMaterial, this.normalRenderTarget, 0x7777ff, 1.0 );
			this._restoreVisibility();

		}

		// render AO

		this.gtaoMaterial.uniforms.cameraNear.value = this.camera.near;
		this.gtaoMaterial.uniforms.cameraFar.value = this.camera.far;
		this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy( this.camera.projectionMatrix );
		this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy( this.camera.projectionMatrixInverse );
		this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy( this.camera.matrixWorld );
		this._renderPass( renderer, this.gtaoMaterial, this.gtaoRenderTarget, 0xffffff, 1.0 );

		// render poisson denoise

		this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy( this.camera.projectionMatrixInverse );
		this._renderPass( renderer, this.pdMaterial, this.pdRenderTarget, 0xffffff, 1.0 );

		// output result to screen

		switch ( this.output ) {

			case GTAOPass.OUTPUT.Off:
				break;

			case GTAOPass.OUTPUT.Diffuse:

				this.copyMaterial.uniforms.tDiffuse.value = readBuffer.texture;
				this.copyMaterial.blending = NoBlending;
				this._renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case GTAOPass.OUTPUT.AO:

				this.copyMaterial.uniforms.tDiffuse.value = this.gtaoRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this._renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case GTAOPass.OUTPUT.Denoise:

				this.copyMaterial.uniforms.tDiffuse.value = this.pdRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this._renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case GTAOPass.OUTPUT.Depth:

				this.depthRenderMaterial.uniforms.cameraNear.value = this.camera.near;
				this.depthRenderMaterial.uniforms.cameraFar.value = this.camera.far;
				this._renderPass( renderer, this.depthRenderMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case GTAOPass.OUTPUT.Normal:

				this.copyMaterial.uniforms.tDiffuse.value = this.normalRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this._renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case GTAOPass.OUTPUT.Default:

				this.copyMaterial.uniforms.tDiffuse.value = readBuffer.texture;
				this.copyMaterial.blending = NoBlending;
				this._renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				this.blendMaterial.uniforms.intensity.value = this.blendIntensity;
				this.blendMaterial.uniforms.tDiffuse.value = this.pdRenderTarget.texture;
				this._renderPass( renderer, this.blendMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			default:
				console.warn( 'THREE.GTAOPass: Unknown output type.' );

		}

	}

	// internals

	_renderPass( renderer, passMaterial, renderTarget, clearColor, clearAlpha ) {

		// save original state
		renderer.getClearColor( this._originalClearColor );
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

		this._fsQuad.material = passMaterial;
		this._fsQuad.render( renderer );

		// restore original state
		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this._originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	}

	_renderOverride( renderer, overrideMaterial, renderTarget, clearColor, clearAlpha ) {

		renderer.getClearColor( this._originalClearColor );
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

		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this._originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	}

	_overrideVisibility() {

		const scene = this.scene;
		const cache = this._visibilityCache;

		scene.traverse( function ( object ) {

			cache.set( object, object.visible );

			if ( object.isPoints || object.isLine ) object.visible = false;

		} );

	}

	_restoreVisibility() {

		const scene = this.scene;
		const cache = this._visibilityCache;

		scene.traverse( function ( object ) {

			const visible = cache.get( object );
			object.visible = visible;

		} );

		cache.clear();

	}

	_generateNoise( size = 64 ) {

		const simplex = new SimplexNoise();

		const arraySize = size * size * 4;
		const data = new Uint8Array( arraySize );

		for ( let i = 0; i < size; i ++ ) {

			for ( let j = 0; j < size; j ++ ) {

				const x = i;
				const y = j;

				data[ ( i * size + j ) * 4 ] = ( simplex.noise( x, y ) * 0.5 + 0.5 ) * 255;
				data[ ( i * size + j ) * 4 + 1 ] = ( simplex.noise( x + size, y ) * 0.5 + 0.5 ) * 255;
				data[ ( i * size + j ) * 4 + 2 ] = ( simplex.noise( x, y + size ) * 0.5 + 0.5 ) * 255;
				data[ ( i * size + j ) * 4 + 3 ] = ( simplex.noise( x + size, y + size ) * 0.5 + 0.5 ) * 255;

			}

		}

		const noiseTexture = new DataTexture( data, size, size, RGBAFormat, UnsignedByteType );
		noiseTexture.wrapS = RepeatWrapping;
		noiseTexture.wrapT = RepeatWrapping;
		noiseTexture.needsUpdate = true;

		return noiseTexture;

	}

}

GTAOPass.OUTPUT = {
	'Off': - 1,
	'Default': 0,
	'Diffuse': 1,
	'Depth': 2,
	'Normal': 3,
	'AO': 4,
	'Denoise': 5,
};

export { GTAOPass };
