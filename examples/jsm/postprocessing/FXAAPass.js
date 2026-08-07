import { vec2Set } from 'three';
import { FXAAShader } from '../shaders/FXAAShader.js';
import { ShaderPass } from './ShaderPass.js';

/**
 * A pass for applying FXAA.
 *
 * ```js
 * const fxaaPass = new FXAAPass();
 * composer.addPass( fxaaPass );
 * ```
 *
 * @augments ShaderPass
 * @three_import import { FXAAPass } from 'three/addons/postprocessing/FXAAPass.js';
 */
class FXAAPass extends ShaderPass {

	/**
	 * Constructs a new FXAA pass.
	 */
	constructor() {

		super( FXAAShader );

	}

	/**
	 * Sets the size of the pass.
	 *
	 * @param {number} width - The width to set.
	 * @param {number} height - The height to set.
	 */
	setSize( width, height ) {

		vec2Set( 1 / width, 1 / height, this.material.uniforms[ 'resolution' ].value );

	}

}

export { FXAAPass };
