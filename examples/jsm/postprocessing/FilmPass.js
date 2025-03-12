import {
	ShaderMaterial,
	UniformsUtils
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { FilmShader } from '../shaders/FilmShader.js';

/**
 * This pass can be used to create a film grain effect.
 *
 * ```js
 * const filmPass = new FilmPass();
 * composer.addPass( filmPass );
 * ```
 *
 * @augments Pass
 */
class FilmPass extends Pass {

	/**
	 * Constructs a new film pass.
	 *
	 * @param {number} [intensity=0.5] - The grain intensity in the range `[0,1]` (0 = no effect, 1 = full effect).
	 * @param {boolean} [grayscale=false] - Whether to apply a grayscale effect or not.
	 */
	constructor( intensity = 0.5, grayscale = false ) {

		super();

		const shader = FilmShader;

		/**
		 * The pass uniforms. Use this object if you want to update the
		 * `intensity` or `grayscale` values at runtime.
		 * ```js
		 * pass.uniforms.intensity.value = 1;
		 * pass.uniforms.grayscale.value = true;
		 * ```
		 *
		 * @type {Object}
		 */
		this.uniforms = UniformsUtils.clone( shader.uniforms );

		/**
		 * The pass material.
		 *
		 * @type {ShaderMaterial}
		 */
		this.material = new ShaderMaterial( {

			name: shader.name,
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		} );

		this.uniforms.intensity.value = intensity;
		this.uniforms.grayscale.value = grayscale;

		// internals

		this._fsQuad = new FullScreenQuad( this.material );

	}

	/**
	 * Performs the film pass.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
	 * destination for the pass.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
	 * previous pass from this buffer.
	 * @param {number} deltaTime - The delta time in seconds.
	 * @param {boolean} maskActive - Whether masking is active or not.
	 */
	render( renderer, writeBuffer, readBuffer, deltaTime /*, maskActive */ ) {

		this.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
		this.uniforms[ 'time' ].value += deltaTime;

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

export { FilmPass };
