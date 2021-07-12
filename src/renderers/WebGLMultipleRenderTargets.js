import { WebGLRenderTarget } from './WebGLRenderTarget.js';

class WebGLMultipleRenderTargets extends WebGLRenderTarget {

	constructor( width, height, count ) {

		console.warn( 'WebGLMultipleRenderTargets is deprecated, use WebGLRenderTarget(width, height, {count: count}) instead.' );
		super( width, height, { count: count } );

	}

	get texture() {

		return this.textures;

	}

}

WebGLMultipleRenderTargets.prototype.isWebGLMultipleRenderTargets = true;

export { WebGLMultipleRenderTargets };
