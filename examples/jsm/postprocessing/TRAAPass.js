import { FloatType, HalfFloatType, Matrix4, NearestFilter, NoBlending, ShaderMaterial, UniformsUtils, WebGLRenderTarget } from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { CopyShader } from '../shaders/CopyShader.js';
import { TRAAShader } from '../shaders/TRAAShader.js';

/**
 * Temporal reprojection antialiasing for WebGL, based on TRAANode. Add after
 * scene lighting/effects and before OutputPass; disable MSAA. The color input
 * must be linear HDR and share the GBuffer's camera and physical dimensions.
 * Use renderFrame() to jitter the entire composer, including GBuffer and beauty.
 * Call reset() after camera cuts, toggles or discontinuous lighting changes.
 * Blended objects and background have no GBuffer motion; deformed/instanced
 * meshes reject history until previous deformation support is implemented.
 *
 * ```js
 * const gBuffer = new GBufferPass( scene, camera, width, height, { velocity: true } );
 * const traa = new TRAAPass( camera, gBuffer );
 * composer.addPass( gBuffer );
 * composer.addPass( new RenderPass( scene, camera ) );
 * composer.addPass( traa );
 * composer.addPass( new OutputPass() );
 * traa.renderFrame( composer );
 * ```
 *
 * @augments Pass
 * @three_import import { TRAAPass } from 'three/addons/postprocessing/TRAAPass.js';
 */
class TRAAPass extends Pass {

	/**
	 * @param {Camera} camera - The shared scene camera.
	 * @param {GBufferPass} gBufferPass - A GBuffer with options.velocity enabled.
	 */
	constructor( camera, gBufferPass ) {

		super();
		if ( gBufferPass.velocityTexture === null ) throw new Error( 'THREE.TRAAPass: GBufferPass requires options.velocity.' );
		if ( gBufferPass.camera !== camera ) throw new Error( 'THREE.TRAAPass: Camera must match GBufferPass.' );
		this.camera = camera;
		this.gBufferPass = gBufferPass;
		this.depthThreshold = 0.0005;
		this.maxVelocityLength = 128;
		this.useSubpixelCorrection = true;
		this._historyValid = false;
		this._jitterIndex = 0;
		this._projection = new Matrix4();
		this._projectionInverse = new Matrix4();
		this._jitterActive = false;
		this._previousVelocityProjection = null;
		this._history = new WebGLRenderTarget( 1, 1, { count: 2, type: HalfFloatType, depthBuffer: false } );
		this._resolve = this._history.clone();
		for ( const target of [ this._history, this._resolve ] ) {

			target.textures[ 1 ].type = FloatType;
			target.textures[ 1 ].minFilter = NearestFilter;
			target.textures[ 1 ].magFilter = NearestFilter;

		}

		this._material = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( TRAAShader.uniforms ),
			vertexShader: TRAAShader.vertexShader,
			fragmentShader: TRAAShader.fragmentShader,
			depthTest: false, depthWrite: false, blending: NoBlending
		} );
		this._copyMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( CopyShader.uniforms ),
			vertexShader: CopyShader.vertexShader,
			fragmentShader: CopyShader.fragmentShader,
			depthTest: false, depthWrite: false, blending: NoBlending
		} );
		this._quad = new FullScreenQuad();
		this._material.uniforms.resolution.value.set( 1, 1 );

	}

	/** Resets both temporal color history and the GBuffer's motion history. */
	reset() {

		this._historyValid = false;
		this._jitterIndex = 0;
		this.gBufferPass.resetVelocity();

	}

	/**
	 * Applies a Halton(2,3) pixel offset while retaining unjittered motion vectors.
	 * Existing cropped views and custom projection matrices are preserved.
	 *
	 * @param {number} width - Width in physical pixels.
	 * @param {number} height - Height in physical pixels.
	 */
	setViewOffset( width, height ) {

		if ( this._jitterActive ) throw new Error( 'THREE.TRAAPass: Jitter already active.' );
		this._projection.copy( this.camera.projectionMatrix );
		this._projectionInverse.copy( this.camera.projectionMatrixInverse );
		this._previousVelocityProjection = this.gBufferPass.setVelocityProjectionMatrix( this._projection );
		const index = this._jitterIndex % 32 + 1;
		const dx = - 2 * ( halton( index, 2 ) - 0.5 ) / width;
		const dy = 2 * ( halton( index, 3 ) - 0.5 ) / height;
		const e = this.camera.projectionMatrix.elements;
		for ( let column = 0; column < 4; column ++ ) {

			const offset = column * 4;
			e[ offset ] += dx * e[ offset + 3 ];
			e[ offset + 1 ] += dy * e[ offset + 3 ];

		}

		this.camera.projectionMatrixInverse.copy( this.camera.projectionMatrix ).invert();
		this._jitterActive = true;

	}

	/** Restores the projection matrix after all passes have rendered. */
	clearViewOffset() {

		if ( ! this._jitterActive ) return;
		this.camera.projectionMatrix.copy( this._projection );
		this.camera.projectionMatrixInverse.copy( this._projectionInverse );
		this.gBufferPass.setVelocityProjectionMatrix( this._previousVelocityProjection );
		this._jitterActive = false;
		this._jitterIndex = ( this._jitterIndex + 1 ) % 32;

	}

	/**
	 * Renders a complete composer frame with exception-safe jitter restoration.
	 *
	 * @param {EffectComposer} composer - The composer containing this pass.
	 * @param {number} [deltaTime] - The frame delta in seconds.
	 */
	renderFrame( composer, deltaTime ) {

		if ( ! this.enabled ) {

			this.reset();
			composer.render( deltaTime );
			return;

		}

		const depth = this.gBufferPass.depthTexture.image;
		this.setViewOffset( depth.width, depth.height );
		try {

			composer.render( deltaTime );

		} catch ( error ) {

			this.reset();
			throw error;

		} finally {

			this.clearViewOffset();

		}

	}

	/**
	 * Resolves color into history, then writes the composer output.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - The output buffer.
	 * @param {WebGLRenderTarget} readBuffer - The input color buffer.
	 */
	render( renderer, writeBuffer, readBuffer ) {

		const depth = this.gBufferPass.depthTexture.image;
		if ( depth.width !== readBuffer.width || depth.height !== readBuffer.height ) {

			throw new Error( 'THREE.TRAAPass: Color and GBuffer dimensions must match.' );

		}

		this.setSize( readBuffer.width, readBuffer.height );
		const target = renderer.getRenderTarget();
		const face = renderer.getActiveCubeFace();
		const level = renderer.getActiveMipmapLevel();
		const autoClear = renderer.autoClear;
		try {

			renderer.autoClear = false;
			const uniforms = this._material.uniforms;
			uniforms.tDiffuse.value = readBuffer.texture;
			uniforms.tDepth.value = this.gBufferPass.depthTexture;
			uniforms.tVelocity.value = this.gBufferPass.velocityTexture;
			uniforms.tHistory.value = this._history.texture;
			uniforms.tHistoryDepth.value = this._history.textures[ 1 ];
			uniforms.historyValid.value = this._historyValid;
			uniforms.depthThreshold.value = this.depthThreshold;
			uniforms.maxVelocityLength.value = Math.max( this.maxVelocityLength, 1e-7 );
			uniforms.useSubpixelCorrection.value = this.useSubpixelCorrection;
			this._quad.material = this._material;
			renderer.setRenderTarget( this._resolve );
			this._quad.render( renderer );
			this._copyMaterial.uniforms.tDiffuse.value = this._resolve.texture;
			this._quad.material = this._copyMaterial;
			renderer.setRenderTarget( this.renderToScreen ? null : writeBuffer );
			this._quad.render( renderer );
			[ this._history, this._resolve ] = [ this._resolve, this._history ];
			this._historyValid = true;

		} finally {

			renderer.autoClear = autoClear;
			renderer.setRenderTarget( target, face, level );

		}

	}

	/**
	 * Resizes history; dimensions are physical pixels.
	 *
	 * @param {number} width - Width.
	 * @param {number} height - Height.
	 */
	setSize( width, height ) {

		if ( this._history.width === width && this._history.height === height ) return;
		this._history.setSize( width, height );
		this._resolve.setSize( width, height );
		this._material.uniforms.resolution.value.set( width, height );
		this._historyValid = false;

	}

	/** Frees the pass-owned targets and materials. */
	dispose() {

		this.clearViewOffset();
		this._history.dispose();
		this._resolve.dispose();
		this._material.dispose();
		this._copyMaterial.dispose();
		this._quad.dispose();

	}

}

function halton( index, base ) {

	let fraction = 1;
	let result = 0;
	while ( index > 0 ) {

		fraction /= base;
		result += fraction * ( index % base );
		index = Math.floor( index / base );

	}

	return result;

}

export { TRAAPass };
