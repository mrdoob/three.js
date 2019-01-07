import { WebGLRenderTarget } from './WebGLRenderTarget.js';

/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author Matt DesLauriers / @mattdesl
 */

function WebGLMultisampleRenderTarget( width, height, options ) {

	WebGLRenderTarget.call( this, width, height, options );

	options = options || {};

	this.samples = options.samples !== undefined ? options.samples : 4;

}

WebGLMultisampleRenderTarget.prototype = Object.assign( Object.create( WebGLRenderTarget.prototype ), {

	constructor: WebGLMultisampleRenderTarget,

	isWebGLMultisampleRenderTarget: true,

	copy: function ( source ) {

		WebGLRenderTarget.prototype.copy.call( this, source );

		this.samples = source.samples;

		return this;

	}

} );


export { WebGLMultisampleRenderTarget };
