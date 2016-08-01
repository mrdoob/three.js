import { WebGLRenderTarget } from './WebGLRenderTarget';

/**
 * @author Matt DesLauriers / @mattdesl
 */

function WebGLMultiRenderTarget( width, height, options ) {

	WebGLRenderTarget.call( this, width, height, options );

	this.attachments = [ this.texture ];
};

WebGLMultiRenderTarget.prototype = Object.create( WebGLRenderTarget.prototype );
WebGLMultiRenderTarget.prototype.constructor = WebGLMultiRenderTarget;

WebGLMultiRenderTarget.prototype.isWebGLMultiRenderTarget = true;

WebGLMultiRenderTarget.copy = function ( source ) {

WebGLRenderTarget.prototype.copy.call( this, source );

	this.attachments = source.attachments.map(function ( attachment ) {
		return attachment.clone();
	});

	return this;

};

export { WebGLMultiRenderTarget };
