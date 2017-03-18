import { WebGLRenderTarget } from './WebGLRenderTarget';

/**
 * @author alteredq / http://alteredqualia.com
 */

function WebGLRenderTargetCube( width, height, options ) {

	WebGLRenderTarget.call( this, width, height, options );

	this.activeCubeFace = 0; // PX 0, NX 1, PY 2, NY 3, PZ 4, NZ 5
	this.activeMipMapLevel = 0;

}

WebGLRenderTargetCube.prototype = Object.create( WebGLRenderTarget.prototype );
WebGLRenderTargetCube.prototype.constructor = WebGLRenderTargetCube;

WebGLRenderTargetCube.prototype.isWebGLRenderTargetCube = true;


export { WebGLRenderTargetCube };
