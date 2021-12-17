import { WebGLRenderTarget } from './WebGLRenderTarget.js';

class WebGLMultisampleRenderTarget extends WebGLRenderTarget {

	constructor( width, height, options = {} ) {

		super( width, height, options );

		this.samples = 4;

		this.ignoreDepthForMultisampleCopy = options.ignoreDepth !== undefined ? options.ignoreDepth : true;
		this.useRenderToTexture = ( options.useRenderToTexture !== undefined ) ? options.useRenderToTexture : false;
		this.useRenderbuffer = this.useRenderToTexture === false;

	}

	copy( source ) {

		super.copy.call( this, source );

		this.samples = source.samples;
		this.useRenderToTexture = source.useRenderToTexture;
		this.useRenderbuffer = source.useRenderbuffer;

		return this;

	}

}

WebGLMultisampleRenderTarget.prototype.isWebGLMultisampleRenderTarget = true;

export { WebGLMultisampleRenderTarget };
