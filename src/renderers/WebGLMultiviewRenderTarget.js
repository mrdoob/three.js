/**
 * @author fernandojsg / http://fernandojsg.com
 * @author Takahiro https://github.com/takahirox
 */

import { WebGLRenderTarget } from './WebGLRenderTarget.js';

function WebGLMultiviewRenderTarget( width, height, numViews, options ) {

	WebGLRenderTarget.call( this, width, height, options );

	this.depthBuffer = false;
	this.stencilBuffer = false;

	this.numViews = numViews;

}

WebGLMultiviewRenderTarget.prototype = Object.assign( Object.create( WebGLRenderTarget.prototype ), {

	constructor: WebGLMultiviewRenderTarget,

	isWebGLMultiviewRenderTarget: true,

	copy: function ( source ) {

		WebGLRenderTarget.prototype.copy.call( this, source );

		this.numViews = source.numViews;

		return this;

	}

} );

export { WebGLMultiviewRenderTarget };
