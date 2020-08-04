import { WebGLRenderTarget } from './WebGLRenderTarget.js';

class WebGLMultisampleRenderTarget extends WebGLRenderTarget {

	constructor( width, height, options ) {

		super( width, height, options );

		this.samples = 4;

		this.isWebGLMultisampleRenderTarget = true;

	}

	copy( source ) {

		super.copy( source );

		this.samples = source.samples;

		return this;

	}

}

export { WebGLMultisampleRenderTarget };
