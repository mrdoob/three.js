import { WebGLRenderTarget } from './WebGLRenderTarget.js';

/**
 * @author alteredq / http://alteredqualia.com
 */

function WebGLRenderTargetCube( width, height, options ) {

	WebGLRenderTarget.call( this, width, height, options );

}

WebGLRenderTargetCube.prototype = Object.create( WebGLRenderTarget.prototype );
WebGLRenderTargetCube.prototype.constructor = WebGLRenderTargetCube;

WebGLRenderTargetCube.prototype.isWebGLRenderTargetCube = true;


export { WebGLRenderTargetCube };
