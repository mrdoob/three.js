import { WebGLRenderTarget } from './renderers/WebGLRenderTarget.js';

export class WebGLMultipleRenderTargets extends WebGLRenderTarget { // @deprecated, r155

	constructor( width = 1, height = 1, count = 1, options = {} ) {

		console.warn( 'THREE.WebGLMultipleRenderTargets has been removed. Use THREE.WebGLRenderTarget and set the "count" parameter to enable MRT.' );

		super( width, height, { ...options, count } );

		this.isWebGLMultipleRenderTargets = true;

	}

	get texture() {

		return this.textures;

	}

}
