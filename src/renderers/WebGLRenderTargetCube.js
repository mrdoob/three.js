import { WebGLRenderTarget } from './WebGLRenderTarget.js';

/**
 * @author alteredq / http://alteredqualia.com
 */

class WebGLRenderTargetCube extends WebGLRenderTarget {

	constructor( width, height, options ) {

		super( width, height, options );

		this.activeCubeFace = 0; // PX 0, NX 1, PY 2, NY 3, PZ 4, NZ 5
		this.activeMipMapLevel = 0;

	}

}




WebGLRenderTargetCube.prototype.isWebGLRenderTargetCube = true;


export { WebGLRenderTargetCube };
