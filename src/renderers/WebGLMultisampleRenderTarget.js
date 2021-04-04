import { WebGLRenderTarget } from './WebGLRenderTarget.js';

class WebGLMultisampleRenderTarget extends WebGLRenderTarget {

	constructor( width, height, options ) {

		super( width, height, options );

		this.samples = 4;
		this.toScreen = false;

	}

	copy( source ) {

		super.copy.call( this, source );

		this.samples = source.samples;
		this.toScreen = source.toScreen;

		return this;

	}

}

WebGLMultisampleRenderTarget.prototype.isWebGLMultisampleRenderTarget = true;

export { WebGLMultisampleRenderTarget };
