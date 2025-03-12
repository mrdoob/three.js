import {
	ShaderMaterial,
	UniformsUtils
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { HalftoneShader } from '../shaders/HalftoneShader.js';

/**
 * Pass for creating a RGB halftone effect.
 *
 * ```js
 * const params = {
 * 	shape: 1,
 * 	radius: 4,
 * 	rotateR: Math.PI / 12,
 * 	rotateB: Math.PI / 12 * 2,
 * 	rotateG: Math.PI / 12 * 3,
 * 	scatter: 0,
 * 	blending: 1,
 * 	blendingMode: 1,
 * 	greyscale: false,
 * 	disable: false
 * };
 * const halftonePass = new HalftonePass( params );
 * composer.addPass( halftonePass );
 * ```
 *
 * @augments Pass
 */
class HalftonePass extends Pass {

	/**
	 * Constructs a new halftone pass.
	 *
	 * @param {Object} params - The halftone shader parameter.
	 */
	constructor( params ) {

		super();

		/**
		 * The pass uniforms.
		 *
		 * @type {Object}
		 */
	 	this.uniforms = UniformsUtils.clone( HalftoneShader.uniforms );

		/**
		 * The pass material.
		 *
		 * @type {ShaderMaterial}
		 */
	 	this.material = new ShaderMaterial( {
	 		uniforms: this.uniforms,
	 		fragmentShader: HalftoneShader.fragmentShader,
	 		vertexShader: HalftoneShader.vertexShader
	 	} );


		for ( const key in params ) {

			if ( params.hasOwnProperty( key ) && this.uniforms.hasOwnProperty( key ) ) {

				this.uniforms[ key ].value = params[ key ];

			}

		}

		// internals

		this._fsQuad = new FullScreenQuad( this.material );

	}

	/**
	 * Performs the halftone pass.
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

 		this.material.uniforms[ 'tDiffuse' ].value = readBuffer.texture;

 		if ( this.renderToScreen ) {

 			renderer.setRenderTarget( null );
 			this._fsQuad.render( renderer );

		} else {

 			renderer.setRenderTarget( writeBuffer );
 			if ( this.clear ) renderer.clear();
			this._fsQuad.render( renderer );

		}

 	}

	/**
	 * Sets the size of the pass.
	 *
	 * @param {number} width - The width to set.
	 * @param {number} height - The width to set.
	 */
 	setSize( width, height ) {

 		this.uniforms.width.value = width;
 		this.uniforms.height.value = height;

 	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever the pass is no longer used in your app.
	 */
	dispose() {

		this.material.dispose();

		this._fsQuad.dispose();

	}

}

export { HalftonePass };
