import { WebGLRenderTarget } from './WebGLRenderTarget.js';

/**
 * @author Matt DesLauriers / @mattdesl
 * @author Takahiro https://github.com/takahirox
 */

function WebGLMultiRenderTarget( width, height, numAttachments, options ) {

	WebGLRenderTarget.call( this, width, height, options );

	this.textures = [];

	for ( var i = 0; i < numAttachments; i ++ ) {

		this.textures[ i ] = this.texture.clone();

	}

}

WebGLMultiRenderTarget.prototype = Object.assign( Object.create( WebGLRenderTarget.prototype ), {

	constructor: WebGLMultiRenderTarget,

	isWebGLMultiRenderTarget: true,

	copy: function ( source ) {

		WebGLRenderTarget.prototype.copy.call( this, source );

		this.textures.length = 0;

		for ( var i = 0, il = source.textures.length; i < il; i ++ ) {

			this.textures[ i ] = source.textures[ i ].clone();

		}

		return this;

	},

	setNumAttachments( num ) {

		if ( this.textures.length !== num ) {

			this.dispose();

			if ( num > this.textures.length ) {

				for ( var i = this.textures.length; i < num; i ++ ) {

					this.textures[ i ] = this.texture.clone();

				}

			} else {

				this.textures.length = num;

			}

		}

	}

} );


export { WebGLMultiRenderTarget };
