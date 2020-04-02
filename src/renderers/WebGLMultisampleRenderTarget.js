import { WebGLRenderTarget } from './WebGLRenderTarget.js';

/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author Matt DesLauriers / @mattdesl
 */

class WebGLMultisampleRenderTarget extends WebGLRenderTarget {

	constructor( width, height, options ) {

		super( width, height, options );
		this.samples = 4;

	}

	copy( source ) {

		super().copy( source );

		this.samples = source.samples;

		return this;

	}

}

WebGLMultisampleRenderTarget.prototype.isWebGLMultisampleRenderTarget = true;


export { WebGLMultisampleRenderTarget };
