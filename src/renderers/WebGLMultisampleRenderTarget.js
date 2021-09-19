import { WebGLRenderTarget } from './WebGLRenderTarget.js';

class WebGLMultisampleRenderTarget extends WebGLRenderTarget {

	constructor( width, height, options = {} ) {

		super( width, height, options );

		this.samples = 4;
		this.useMultisampleRenderToTexture = ( options.useMultisampleRenderToTexture !== undefined ) ? options.useMultisampleRenderToTexture : false;
		this.useMultisampleRenderbuffer = this.useMultisampleRenderToTexture === false;

	}

	copy( source ) {

		super.copy.call( this, source );

		this.samples = source.samples;
		this.useMultisampleRenderToTexture = source.useMultisampleRenderToTexture;
		this.useMultisampleRenderbuffer = source.useMultisampleRenderbuffer;

		return this;

	}

}

WebGLMultisampleRenderTarget.prototype.isWebGLMultisampleRenderTarget = true;

export { WebGLMultisampleRenderTarget };
