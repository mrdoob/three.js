import { EventDispatcher } from './EventDispatcher.js';
import { Texture } from '../textures/Texture.js';
import { LinearFilter } from '../constants.js';
import { Vector4 } from '../math/Vector4.js';
import { Source } from '../textures/Source.js';

/**
 * A render target is a buffer where the video card draws pixels for a scene
 * that is being rendered in the background. It is used in different effects,
 * such as applying postprocessing to a rendered image before displaying it
 * on the screen.
 *
 * @augments EventDispatcher
 */
class RenderTarget extends EventDispatcher {

	/**
	 * Render target options.
	 *
	 * @typedef {Object} RenderTarget~Options
	 * @property {boolean} [generateMipmaps=false] - Whether to generate mipmaps or not.
	 * @property {number} [magFilter=LinearFilter] - The mag filter.
	 * @property {number} [minFilter=LinearFilter] - The min filter.
	 * @property {number} [format=RGBAFormat] - The texture format.
	 * @property {number} [type=UnsignedByteType] - The texture type.
	 * @property {?string} [internalFormat=null] - The texture's internal format.
	 * @property {number} [wrapS=ClampToEdgeWrapping] - The texture's uv wrapping mode.
	 * @property {number} [wrapT=ClampToEdgeWrapping] - The texture's uv wrapping mode.
	 * @property {number} [anisotropy=1] - The texture's anisotropy value.
	 * @property {string} [colorSpace=NoColorSpace] - The texture's color space.
	 * @property {boolean} [depthBuffer=true] - Whether to allocate a depth buffer or not.
	 * @property {boolean} [stencilBuffer=false] - Whether to allocate a stencil buffer or not.
	 * @property {boolean} [resolveDepthBuffer=true] - Whether to resolve the depth buffer or not.
	 * @property {boolean} [resolveStencilBuffer=true] - Whether  to resolve the stencil buffer or not.
	 * @property {?Texture} [depthTexture=null] - Reference to a depth texture.
	 * @property {number} [samples=0] - The MSAA samples count.
	 * @property {number} [count=1] - Defines the number of color attachments . Must be at least `1`.
	 * @property {boolean} [multiview=false] - Whether this target is used for multiview rendering.
	 */

	/**
	 * Constructs a new render target.
	 *
	 * @param {number} [width=1] - The width of the render target.
	 * @param {number} [height=1] - The height of the render target.
	 * @param {RenderTarget~Options} [options] - The configuration object.
	 */
	constructor( width = 1, height = 1, options = {} ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isRenderTarget = true;

		/**
		 * The width of the render target.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.width = width;

		/**
		 * The height of the render target.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.height = height;

		/**
		 * The depth of the render target.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.depth = options.depth ? options.depth : 1;

		/**
		 * A rectangular area inside the render target's viewport. Fragments that are
		 * outside the area will be discarded.
		 *
		 * @type {Vector4}
		 * @default (0,0,width,height)
		 */
		this.scissor = new Vector4( 0, 0, width, height );

		/**
		 * Indicates whether the scissor test should be enabled when rendering into
		 * this render target or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.scissorTest = false;

		/**
		 * A rectangular area representing the render target's viewport.
		 *
		 * @type {Vector4}
		 * @default (0,0,width,height)
		 */
		this.viewport = new Vector4( 0, 0, width, height );

		const image = { width: width, height: height, depth: this.depth };

		options = Object.assign( {
			generateMipmaps: false,
			internalFormat: null,
			minFilter: LinearFilter,
			depthBuffer: true,
			stencilBuffer: false,
			resolveDepthBuffer: true,
			resolveStencilBuffer: true,
			depthTexture: null,
			samples: 0,
			count: 1,
			multiview: false
		}, options );

		const texture = new Texture( image, options.mapping, options.wrapS, options.wrapT, options.magFilter, options.minFilter, options.format, options.type, options.anisotropy, options.colorSpace );

		texture.flipY = false;
		texture.generateMipmaps = options.generateMipmaps;
		texture.internalFormat = options.internalFormat;

		/**
		 * An array of textures. Each color attachment is represented as a separate texture.
		 * Has at least a single entry for the default color attachment.
		 *
		 * @type {Array<Texture>}
		 */
		this.textures = [];

		const count = options.count;
		for ( let i = 0; i < count; i ++ ) {

			this.textures[ i ] = texture.clone();
			this.textures[ i ].isRenderTargetTexture = true;
			this.textures[ i ].renderTarget = this;

		}

		/**
		 * Whether to allocate a depth buffer or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.depthBuffer = options.depthBuffer;

		/**
		 * Whether to allocate a stencil buffer or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.stencilBuffer = options.stencilBuffer;

		/**
		 * Whether to resolve the depth buffer or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.resolveDepthBuffer = options.resolveDepthBuffer;

		/**
		 * Whether to resolve the stencil buffer or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.resolveStencilBuffer = options.resolveStencilBuffer;

		this._depthTexture = null;
		this.depthTexture = options.depthTexture;

		/**
		 * The number of MSAA samples.
		 *
		 * A value of `0` disables MSAA.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.samples = options.samples;

		/**
		 * Whether to this target is used in multiview rendering.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.multiview = options.multiview;

	}

	/**
	 * The texture representing the default color attachment.
	 *
	 * @type {Texture}
	 */
	get texture() {

		return this.textures[ 0 ];

	}

	set texture( value ) {

		this.textures[ 0 ] = value;

	}

	set depthTexture( current ) {

		if ( this._depthTexture !== null ) this._depthTexture.renderTarget = null;
		if ( current !== null ) current.renderTarget = this;

		this._depthTexture = current;

	}

	/**
	 * Instead of saving the depth in a renderbuffer, a texture
	 * can be used instead which is useful for further processing
	 * e.g. in context of post-processing.
	 *
	 * @type {?DepthTexture}
	 * @default null
	 */
	get depthTexture() {

		return this._depthTexture;

	}

	/**
	 * Sets the size of this render target.
	 *
	 * @param {number} width - The width.
	 * @param {number} height - The height.
	 * @param {number} [depth=1] - The depth.
	 */
	setSize( width, height, depth = 1 ) {

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

	}

	/**
	 * Returns a new render target with copied values from this instance.
	 *
	 * @return {RenderTarget} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Copies the settings of the given render target. This is a structural copy so
	 * no resources are shared between render targets after the copy. That includes
	 * all MRT textures and the depth texture.
	 *
	 * @param {RenderTarget} source - The render target to copy.
	 * @return {RenderTarget} A reference to this instance.
	 */
	copy( source ) {

		this.width = source.width;
		this.height = source.height;
		this.depth = source.depth;

		this.scissor.copy( source.scissor );
		this.scissorTest = source.scissorTest;

		this.viewport.copy( source.viewport );

		this.textures.length = 0;

		for ( let i = 0, il = source.textures.length; i < il; i ++ ) {

			this.textures[ i ] = source.textures[ i ].clone();
			this.textures[ i ].isRenderTargetTexture = true;
			this.textures[ i ].renderTarget = this;

			// ensure image object is not shared, see #20328

			const image = Object.assign( {}, source.textures[ i ].image );
			this.textures[ i ].source = new Source( image );

		}

		this.depthBuffer = source.depthBuffer;
		this.stencilBuffer = source.stencilBuffer;

		this.resolveDepthBuffer = source.resolveDepthBuffer;
		this.resolveStencilBuffer = source.resolveStencilBuffer;

		if ( source.depthTexture !== null ) this.depthTexture = source.depthTexture.clone();

		this.samples = source.samples;

		return this;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 *
	 * @fires RenderTarget#dispose
	 */
	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

export { RenderTarget };
