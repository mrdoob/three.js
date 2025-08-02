import {
	WebGLRenderTarget,
	FloatType
} from 'three';

import { SavePass } from 'three/addons/postprocessing/SavePass.js';


/**
* A pass that saves the depth contents of the current read  buffer in a render target.
*
* ```js
* const depthSavePass = new DepthSavePass( customRenderTarget );
* composer.addPass( depthSavePass );
* ```
*
* @augments SavePass
* @three_import import { SavePass } from 'three/addons/postprocessing/SavePass.js';
*/

class DepthSavePass extends SavePass {

	constructor( renderTarget ) {

		if ( renderTarget === undefined ) {

			renderTarget = new WebGLRenderTarget( 1, 1, { type: FloatType } ); // will be resized later
			renderTarget.texture.name = 'DepthSavePass.rt';

		}

		super( renderTarget );

	}

	/**
	 * Performs the depth save pass.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
	 * destination for the pass.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
	 * previous pass from this buffer.
	 * @param {number} deltaTime - The delta time in seconds.
	 * @param {boolean} maskActive - Whether masking is active or not.
	 */

	render( renderer, writeBuffer, readBuffer, /* deltaTime , maskActive */ ) {

		this.uniforms[ 'tDiffuse' ].value = readBuffer.depthTexture;

		renderer.setRenderTarget( this.renderTarget );
		if ( this.clear ) renderer.clear();
		this._fsQuad.render( renderer );

	}

}

export { DepthSavePass };
