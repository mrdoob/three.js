import {
	HalfFloatType,
	NearestFilter,
	NoBlending,
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { CopyShader } from '../shaders/CopyShader.js';
import { AfterimageShader } from '../shaders/AfterimageShader.js';

/**
 * Pass for a basic after image effect.
 *
 * ```js
 * const afterimagePass = new AfterimagePass( 0.9 );
 * composer.addPass( afterimagePass );
 * ```
 *
 * @augments Pass
 * @three_import import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
 */
class AfterimagePass extends Pass {

	/**
	 * Constructs a new after image pass.
	 *
	 * @param {number} [damp=0.96] - The damping intensity. A higher value means a stronger after image effect.
	 */
	constructor( damp = 0.96 ) {

		super();

		/**
		 * The pass uniforms. Use this object if you want to update the
		 * `damp` value at runtime.
		 * ```js
		 * pass.uniforms.damp.value = 0.9;
		 * ```
		 *
		 * @type {Object}
		 */
		this.uniforms = UniformsUtils.clone( AfterimageShader.uniforms );

		this.uniforms[ 'damp' ].value = damp;

		/**
		 * The composition material.
		 *
		 * @type {ShaderMaterial}
		 */
		this.compFsMaterial = new ShaderMaterial( {

			uniforms: this.uniforms,
			vertexShader: AfterimageShader.vertexShader,
			fragmentShader: AfterimageShader.fragmentShader

		} );

		/**
		 * The copy material.
		 *
		 * @type {ShaderMaterial}
		 */
		this.copyFsMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( CopyShader.uniforms ),
			vertexShader: CopyShader.vertexShader,
			fragmentShader: CopyShader.fragmentShader,
			blending: NoBlending,
			depthTest: false,
			depthWrite: false
		} );

		// internals

		this._textureComp = new WebGLRenderTarget( window.innerWidth, window.innerHeight, {
			magFilter: NearestFilter,
			type: HalfFloatType
		} );

		this._textureOld = new WebGLRenderTarget( window.innerWidth, window.innerHeight, {
			magFilter: NearestFilter,
			type: HalfFloatType
		} );

		this._compFsQuad = new FullScreenQuad( this.compFsMaterial );
		this._copyFsQuad = new FullScreenQuad( this.copyFsMaterial );

	}

	/**
	 * Performs the after image pass.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
	 * destination for the pass.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
	 * previous pass from this buffer.
	 * @param {number} deltaTime - The delta time in seconds.
	 * @param {boolean} maskActive - Whether masking is active or not.
	 */
	render( renderer, writeBuffer, readBuffer/*, deltaTime, maskActive*/ ) {

		this.uniforms[ 'tOld' ].value = this._textureOld.texture;
		this.uniforms[ 'tNew' ].value = readBuffer.texture;

		renderer.setRenderTarget( this._textureComp );
		this._compFsQuad.render( renderer );

		this._copyFsQuad.material.uniforms.tDiffuse.value = this._textureComp.texture;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this._copyFsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );

			if ( this.clear ) renderer.clear();

			this._copyFsQuad.render( renderer );

		}

		// Swap buffers.
		const temp = this._textureOld;
		this._textureOld = this._textureComp;
		this._textureComp = temp;
		// Now textureOld contains the latest image, ready for the next frame.

	}

	/**
	 * Sets the size of the pass.
	 *
	 * @param {number} width - The width to set.
	 * @param {number} height - The width to set.
	 */
	setSize( width, height ) {

		this._textureComp.setSize( width, height );
		this._textureOld.setSize( width, height );

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever the pass is no longer used in your app.
	 */
	dispose() {

		this._textureComp.dispose();
		this._textureOld.dispose();

		this.compFsMaterial.dispose();
		this.copyFsMaterial.dispose();

		this._compFsQuad.dispose();
		this._copyFsQuad.dispose();

	}

}

export { AfterimagePass };
