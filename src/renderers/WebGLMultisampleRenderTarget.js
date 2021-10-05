import { WebGLRenderTarget } from './WebGLRenderTarget.js';

class WebGLMultisampleRenderTarget extends WebGLRenderTarget {

	constructor( width, height, options = {} ) {

		super( width, height, options );

		this.samples = 4;

		this.ignoreDepthForMultisampleCopy = options.ignoreDepth !== undefined ? options.ignoreDepth : true;
		this.useRenderToTexture = ( options.useMultisampledRenderToTexture !== undefined ) ? options.useMultisampledRenderToTexture : false;
		this.useRenderbuffer = this.useRenderToTexture === false;

	}

	copy( source ) {

		super.copy.call( this, source );

		this.samples = source.samples;
		this.useRenderToTexture = source.useMultisampledRenderToTexture;
		this.useRenderbuffer = source.useRenderbuffer;

		return this;

	}

}

WebGLMultisampleRenderTarget.prototype.isWebGLMultisampleRenderTarget = true;

export { WebGLMultisampleRenderTarget };
