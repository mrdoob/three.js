import {
	DataTexture,
	FloatType,
	MathUtils,
	RedFormat,
	ShaderMaterial,
	UniformsUtils
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { DigitalGlitch } from '../shaders/DigitalGlitch.js';

/**
 * Pass for creating a glitch effect.
 *
 * ```js
 * const glitchPass = new GlitchPass();
 * composer.addPass( glitchPass );
 * ```
 *
 * @augments Pass
 * @three_import import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
 */
class GlitchPass extends Pass {

	/**
	 * Constructs a new glitch pass.
	 *
	 * @param {number} [dt_size=64] - The size of the displacement texture
	 * for digital glitch squares.
	 */
	constructor( dt_size = 64 ) {

		super();

		/**
		 * The pass uniforms.
		 *
		 * @type {Object}
		 */
		this.uniforms = UniformsUtils.clone( DigitalGlitch.uniforms );

		/**
		 * The pass material.
		 *
		 * @type {ShaderMaterial}
		 */
		this.material = new ShaderMaterial( {
			uniforms: this.uniforms,
			vertexShader: DigitalGlitch.vertexShader,
			fragmentShader: DigitalGlitch.fragmentShader
		} );

		/**
		 * Whether to noticeably increase the effect intensity or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.goWild = false;

		// internals

		this._heightMap = this._generateHeightmap( dt_size );
		this.uniforms[ 'tDisp' ].value = this.heightMap;

		this._fsQuad = new FullScreenQuad( this.material );

		this._curF = 0;
		this._randX = 0;

		this._generateTrigger();

	}

	/**
	 * Performs the glitch pass.
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
		this.uniforms[ 'seed' ].value = Math.random(); // default seeding
		this.uniforms[ 'byp' ].value = 0;

		if ( this._curF % this._randX == 0 || this.goWild == true ) {

			this.uniforms[ 'amount' ].value = Math.random() / 30;
			this.uniforms[ 'angle' ].value = MathUtils.randFloat( - Math.PI, Math.PI );
			this.uniforms[ 'seed_x' ].value = MathUtils.randFloat( - 1, 1 );
			this.uniforms[ 'seed_y' ].value = MathUtils.randFloat( - 1, 1 );
			this.uniforms[ 'distortion_x' ].value = MathUtils.randFloat( 0, 1 );
			this.uniforms[ 'distortion_y' ].value = MathUtils.randFloat( 0, 1 );
			this._curF = 0;
			this._generateTrigger();

		} else if ( this._curF % this._randX < this._randX / 5 ) {

			this.uniforms[ 'amount' ].value = Math.random() / 90;
			this.uniforms[ 'angle' ].value = MathUtils.randFloat( - Math.PI, Math.PI );
			this.uniforms[ 'distortion_x' ].value = MathUtils.randFloat( 0, 1 );
			this.uniforms[ 'distortion_y' ].value = MathUtils.randFloat( 0, 1 );
			this.uniforms[ 'seed_x' ].value = MathUtils.randFloat( - 0.3, 0.3 );
			this.uniforms[ 'seed_y' ].value = MathUtils.randFloat( - 0.3, 0.3 );

		} else if ( this.goWild == false ) {

			this.uniforms[ 'byp' ].value = 1;

		}

		this._curF ++;

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

		this.heightMap.dispose();

		this._fsQuad.dispose();

	}

	// internals

	_generateTrigger() {

		this._randX = MathUtils.randInt( 120, 240 );

	}

	_generateHeightmap( dt_size ) {

		const data_arr = new Float32Array( dt_size * dt_size );
		const length = dt_size * dt_size;

		for ( let i = 0; i < length; i ++ ) {

			const val = MathUtils.randFloat( 0, 1 );
			data_arr[ i ] = val;

		}

		const texture = new DataTexture( data_arr, dt_size, dt_size, RedFormat, FloatType );
		texture.needsUpdate = true;
		return texture;

	}

}

export { GlitchPass };
