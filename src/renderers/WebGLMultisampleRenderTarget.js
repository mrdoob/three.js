import { WebGLRenderTarget } from './WebGLRenderTarget.js';

class WebGLMultisampleRenderTarget extends WebGLRenderTarget {

	constructor( width, height, options = {} ) {

		super( width, height, options );

		this.samples = 4;

		this.useMultisampledRenderToTexture = ( options.useMultisampledRenderToTexture !== undefined ) ? options.useMultisampledRenderToTexture : false;
		this.useMultisampledRenderbuffer = this.useMultisampledRenderToTexture === false;

	}

	copy( source ) {

		super.copy.call( this, source );

		this.samples = source.samples;
		this.useMultisampledRenderToTexture = source.useMultisampledRenderToTexture;
		this.useMultisampledRenderbuffer = source.useMultisampledRenderbuffer;

		return this;

	}

}

WebGLMultisampleRenderTarget.prototype.isWebGLMultisampleRenderTarget = true;

export { WebGLMultisampleRenderTarget };
