import { EventDispatcher } from '../core/EventDispatcher.js';
import { Texture } from '../textures/Texture.js';
import { LinearFilter } from '../constants.js';
import { Vector4 } from '../math/Vector4.js';

/**
 * @author szimek / https://github.com/szimek/
 * @author alteredq / http://alteredqualia.com/
 * @author Marius Kintel / https://github.com/kintel
 */

/*
 In options, we can specify:
 * Texture parameters for an auto-generated target texture
 * depthBuffer/stencilBuffer: Booleans to indicate if we should generate these buffers
*/
function WebGLRenderTarget( width, height, options ) {

	this.width = width;
	this.height = height;

	this.scissor = new Vector4( 0, 0, width, height );
	this.scissorTest = false;

	this.viewport = new Vector4( 0, 0, width, height );

	options = options || {};

	this.texture = new Texture( undefined, options.mapping, options.wrapS, options.wrapT, options.magFilter, options.minFilter, options.format, options.type, options.anisotropy, options.encoding );

	this.texture.image = {};
	this.texture.image.width = width;
	this.texture.image.height = height;

	this.texture.generateMipmaps = options.generateMipmaps !== undefined ? options.generateMipmaps : false;
	this.texture.minFilter = options.minFilter !== undefined ? options.minFilter : LinearFilter;

	this.depthBuffer = options.depthBuffer !== undefined ? options.depthBuffer : true;
	this.stencilBuffer = options.stencilBuffer !== undefined ? options.stencilBuffer : true;
	this.depthTexture = options.depthTexture !== undefined ? options.depthTexture : null;

}

WebGLRenderTarget.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

	constructor: WebGLRenderTarget,

	isWebGLRenderTarget: true,

	setSize: function ( width, height ) {

		if ( this.width !== width || this.height !== height ) {

			this.width = width;
			this.height = height;

			this.texture.image.width = width;
			this.texture.image.height = height;

			this.dispose();

		}

		this.viewport.set( 0, 0, width, height );
		this.scissor.set( 0, 0, width, height );

	},

	swapTexture: function ( newTexture ) {

		var oldTexture = this.texture;

		if ( ! newTexture ) {

			newTexture = new Texture( undefined, oldTexture.mapping, oldTexture.wrapS, oldTexture.wrapT, oldTexture.magFilter, oldTexture.minFilter, oldTexture.format, oldTexture.type, oldTexture.anisotropy, oldTexture.encoding );

			newTexture.image = {};
			newTexture.image.width = this.width;
			newTexture.image.height = this.height;

		} else {

			// Check that the format and type of the new texture match the old - otherwise we can't swap.

			if ( newTexture.isCubeTexture === true || newTexture.isCanvasTexture === true || newTexture.isCompressedTexture === true || newTexture.isDataTexture === true || newTexture.isDepthTexture === true || newTexture.isVideoTexture === true || newTexture.isDataTexture3D === true || newTexture.isDataTexture2DArray === true ) {

				console.error( "Can only swap a regular Texture on a WebGLRenderTarget" );
				return null;

			}

			if ( newTexture.format !== oldTexture.format ) {

				console.error( "Render target texture can only be swapped with a texture with the same format." );
				return null;

			}

			if ( newTexture.type !== oldTexture.type ) {

				console.error( "Render target texture can only be swapped with a texture with the same type." );
				return null;

			}

			if ( newTexture.image !== undefined ) {

				if ( newTexture.image.width !== undefined && newTexture.image.height !== undefined ) {

					this.width = newTexture.image.width;
					this.height = newTexture.image.height;

				}

			}

		}

		this.texture = newTexture;

		this.dispatchEvent( { type: 'textureAttachmentChange' } );

		return oldTexture;

	},

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( source ) {

		this.width = source.width;
		this.height = source.height;

		this.viewport.copy( source.viewport );

		this.texture = source.texture.clone();

		this.depthBuffer = source.depthBuffer;
		this.stencilBuffer = source.stencilBuffer;
		this.depthTexture = source.depthTexture;

		return this;

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

} );


export { WebGLRenderTarget };
