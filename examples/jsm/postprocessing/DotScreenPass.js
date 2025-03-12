import {
	ShaderMaterial,
	UniformsUtils
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { DotScreenShader } from '../shaders/DotScreenShader.js';

/**
 * Pass for creating a dot-screen effect.
 *
 * ```js
 * const pass = new DotScreenPass( new THREE.Vector2( 0, 0 ), 0.5, 0.8 );
 * composer.addPass( pass );
 * ```
 *
 * @augments Pass
 */
class DotScreenPass extends Pass {

	/**
	 * Constructs a new dot screen pass.
	 *
	 * @param {Vector2} center - The center point.
	 * @param {number} angle - The rotation of the effect in radians.
	 * @param {number} scale - The scale of the effect. A higher value means smaller dots.
	 */
	constructor( center, angle, scale ) {

		super();

		/**
		 * The pass uniforms. Use this object if you want to update the
		 * `center`, `angle` or `scale` values at runtime.
		 * ```js
		 * pass.uniforms.center.value.copy( center );
		 * pass.uniforms.angle.value = 0;
		 * pass.uniforms.scale.value = 0.5;
		 * ```
		 *
		 * @type {Object}
		 */
		this.uniforms = UniformsUtils.clone( DotScreenShader.uniforms );

		if ( center !== undefined ) this.uniforms[ 'center' ].value.copy( center );
		if ( angle !== undefined ) this.uniforms[ 'angle' ].value = angle;
		if ( scale !== undefined ) this.uniforms[ 'scale' ].value = scale;

		/**
		 * The pass material.
		 *
		 * @type {ShaderMaterial}
		 */
		this.material = new ShaderMaterial( {

			name: DotScreenShader.name,
			uniforms: this.uniforms,
			vertexShader: DotScreenShader.vertexShader,
			fragmentShader: DotScreenShader.fragmentShader

		} );

		// internals

		this._fsQuad = new FullScreenQuad( this.material );

	}

	/**
	 * Performs the dot screen pass.
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

		this.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
		this.uniforms[ 'tSize' ].value.set( readBuffer.width, readBuffer.height );

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
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever the pass is no longer used in your app.
	 */
	dispose() {

		this.material.dispose();

		this._fsQuad.dispose();

	}

}

export { DotScreenPass };
