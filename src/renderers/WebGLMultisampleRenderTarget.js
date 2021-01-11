import { WebGLRenderTarget } from './WebGLRenderTarget.js';

class WebGLMultisampleRenderTarget extends WebGLRenderTarget {

	constructor( width, height, options ) {

		super( width, height, options );

		Object.defineProperty( this, 'isWebGLMultisampleRenderTarget', { value: true } );

		this.samples = 4;

	}

	copy( source ) {

		super.copy.call( this, source );

		this.samples = source.samples;

		return this;

	}

}


export { WebGLMultisampleRenderTarget };
