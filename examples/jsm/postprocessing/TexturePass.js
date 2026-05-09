import {
	ShaderMaterial,
	UniformsUtils
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { CopyShader } from '../shaders/CopyShader.js';

/**
 * This pass can be used to render a texture over the entire screen.
 *
 * ```js
 * const texture = new THREE.TextureLoader().load( 'textures/2294472375_24a3b8ef46_o.jpg' );
 * texture.colorSpace = THREE.SRGBColorSpace;
 *
 * const texturePass = new TexturePass( texture );
 * composer.addPass( texturePass );
 * ```
 *
 * @augments Pass
 * @three_import import { TexturePass } from 'three/addons/postprocessing/TexturePass.js';
 */
class TexturePass extends Pass {

	/**
	 * Constructs a new texture pass.
	 *
	 * @param {Texture} map - The texture to render.
	 * @param {number} [opacity=1] - The opacity.
	 */
	constructor( map, opacity = 1 ) {

		super();

		const shader = CopyShader;

		/**
		 * The texture to render.
		 *
		 * @type {Texture}
		 */
		this.map = map;

		/**
		 * The opacity.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.opacity = opacity;

		/**
		 * Overwritten to disable the swap.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.needsSwap = false;

		/**
		 * The pass uniforms.
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

			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			depthTest: false,
			depthWrite: false,
			premultipliedAlpha: true

		} );

		// internals

		this._fsQuad = new FullScreenQuad( null );

	}

	/**
	 * Performs the texture pass.
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

		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this._fsQuad.material = this.material;

		this.uniforms[ 'opacity' ].value = this.opacity;
		this.uniforms[ 'tDiffuse' ].value = this.map;
		this.material.transparent = ( this.opacity < 1.0 );

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );
		if ( this.clear ) renderer.clear();
		this._fsQuad.render( renderer );

		renderer.autoClear = oldAutoClear;

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

export { TexturePass };
