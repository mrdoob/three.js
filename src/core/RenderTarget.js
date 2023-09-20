import { EventDispatcher } from './EventDispatcher.js';
import { Texture } from '../textures/Texture.js';
import { LinearFilter, NoColorSpace, SRGBColorSpace, sRGBEncoding } from '../constants.js';
import { Vector4 } from '../math/Vector4.js';
import { Source } from '../textures/Source.js';
import { warnOnce } from '../utils.js';

/*
 In options, we can specify:
 * Texture parameters for an auto-generated target texture
 * depthBuffer/stencilBuffer: Booleans to indicate if we should generate these buffers
*/
class RenderTarget extends EventDispatcher {

	constructor( width = 1, height = 1, options = {} ) {

		super();

		this.isRenderTarget = true;

		this.width = width;
		this.height = height;
		this.depth = 1;

		this.scissor = new Vector4( 0, 0, width, height );
		this.scissorTest = false;

		this.viewport = new Vector4( 0, 0, width, height );

		const image = { width: width, height: height, depth: 1 };

		if ( options.encoding !== undefined ) {

			// @deprecated, r152
			warnOnce( 'THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace.' );
			options.colorSpace = options.encoding === sRGBEncoding ? SRGBColorSpace : NoColorSpace;

		}

		options = Object.assign( {
			generateMipmaps: false,
			internalFormat: null,
			minFilter: LinearFilter,
			depthBuffer: true,
			stencilBuffer: false,
			depthTexture: null,
			samples: 0
		}, options );

		this.texture = new Texture( image, options.mapping, options.wrapS, options.wrapT, options.magFilter, options.minFilter, options.format, options.type, options.anisotropy, options.colorSpace );
		this.texture.isRenderTargetTexture = true;

		this.texture.flipY = false;
		this.texture.generateMipmaps = options.generateMipmaps;
		this.texture.internalFormat = options.internalFormat;

		this.depthBuffer = options.depthBuffer;
		this.stencilBuffer = options.stencilBuffer;

		this.depthTexture = options.depthTexture;

		this.samples = options.samples;

	}

	setSize( width, height, depth = 1 ) {

		if ( this.width !== width || this.height !== height || this.depth !== depth ) {

			this.width = width;
			this.height = height;
			this.depth = depth;

			this.texture.image.width = width;
			this.texture.image.height = height;
			this.texture.image.depth = depth;

			this.dispose();

		}

		this.viewport.set( 0, 0, width, height );
		this.scissor.set( 0, 0, width, height );

	}

	clone() {

		return new this.constructor().copy( this );

	}

	copy( source ) {

		this.width = source.width;
		this.height = source.height;
		this.depth = source.depth;

		this.scissor.copy( source.scissor );
		this.scissorTest = source.scissorTest;

		this.viewport.copy( source.viewport );

		this.texture = source.texture.clone();
		this.texture.isRenderTargetTexture = true;

		// ensure image object is not shared, see #20328

		const image = Object.assign( {}, source.texture.image );
		this.texture.source = new Source( image );

		this.depthBuffer = source.depthBuffer;
		this.stencilBuffer = source.stencilBuffer;

		if ( source.depthTexture !== null ) this.depthTexture = source.depthTexture.clone();

		this.samples = source.samples;

		return this;

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

export { RenderTarget };
