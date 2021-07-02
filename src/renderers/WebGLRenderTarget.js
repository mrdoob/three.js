import { EventDispatcher } from '../core/EventDispatcher.js';
import { Texture } from '../textures/Texture.js';
import { LinearFilter } from '../constants.js';
import { Vector4 } from '../math/Vector4.js';

/*
 In options, we can specify:
 * Texture parameters for an auto-generated target texture
 * depthBuffer/stencilBuffer: Booleans to indicate if we should generate these buffers
*/
class WebGLRenderTarget extends EventDispatcher {

	constructor( width, height, depth, options = {} ) {

		if ( ! Number.isInteger( depth ) ) {

			options = depth || options;
			depth = 1;

		}

		super();

		this.width = width;
		this.height = height;
		this.depth = depth;

		this.scissor = new Vector4( 0, 0, width, height );
		this.scissorTest = false;

		this.viewport = new Vector4( 0, 0, width, height );

		this.depthBuffer = options.depthBuffer !== undefined ? options.depthBuffer : true;
		this.stencilBuffer = options.stencilBuffer !== undefined ? options.stencilBuffer : false;
		this.depthTexture = options.depthTexture !== undefined ? options.depthTexture : null;

		const count = options.count !== undefined ? options.count : 1;
		const texture = options.texture !== undefined ? options.texture :
			new Texture( undefined, options.mapping, options.wrapS, options.wrapT, options.magFilter,
				options.minFilter, options.format, options.type, options.anisotropy, options.encoding );

		texture.image = { width: width, height: height, depth: depth };
		texture.generateMipmaps = options.generateMipmaps !== undefined ? options.generateMipmaps : false;
		texture.minFilter = options.minFilter !== undefined ? options.minFilter : LinearFilter;

		this.textures = [];
		for ( let i = 0; i < count; i ++ ) {

			this.textures[ i ] = texture.clone();

		}

	}

	get texture() {

		console.log( 'get WebGLRenderTarget.texture' );
		return this.textures[ 0 ];

	}

	set texture( value ) {

		console.log( 'set WebGLRenderTarget.texture' );
		this.textures[ 0 ] = value;

	}

	setTexture( texture, attachment = 0 ) {

		texture.image = {
			width: this.width,
			height: this.height,
			depth: this.depth
		};

		this.textures[ attachment ] = texture;

	}

	setDepthTexture( texture ) {

		texture.image = {
			width: this.width,
			height: this.height,
			depth: this.depth
		};

		this.depthTexture = texture;

	}

	setSize( width, height, depth ) {

		if ( depth === undefined ) depth = this.depth;

		if ( this.width !== width || this.height !== height || this.depth !== depth ) {

			this.width = width;
			this.height = height;
			this.depth = depth;

			for ( let i = 0, il = this.textures.length; i < il; i ++ ) {

				this.textures[ i ].image.width = width;
				this.textures[ i ].image.height = height;
				this.textures[ i ].image.depth = depth;

			}

			this.dispose();

		}

		this.viewport.set( 0, 0, width, height );
		this.scissor.set( 0, 0, width, height );

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( source ) {

		this.dispose();

		this.width = source.width;
		this.height = source.height;
		this.depth = source.depth;

		this.viewport.copy( source.viewport );
		this.scissor.copy( source.scissor );

		this.textures.length = 0;
		for ( let i = 0, il = source.textures.length; i < il; i ++ ) {

			this.textures[ i ] = source.textures[ i ].clone();
			this.textures[ i ].image = { ...this.textures[ i ].image }; // See #20328.

		}

		this.depthBuffer = source.depthBuffer;
		this.stencilBuffer = source.stencilBuffer;
		this.depthTexture = source.depthTexture;

		return this;

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

WebGLRenderTarget.prototype.isWebGLRenderTarget = true;

export { WebGLRenderTarget };
