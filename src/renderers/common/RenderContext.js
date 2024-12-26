import { Vector4 } from '../../math/Vector4.js';
import { hashArray } from '../../nodes/core/NodeUtils.js';

let _id = 0;

/**
 * Any render or compute command is executed in a specific context that defines
 * the state of the renderer and its backend. Typical examples for such context
 * data are the current clear values or data from the active framebuffer. This
 * module is used to represent these contexts as objects.
 *
 * @private
 */
class RenderContext {

	/**
	 * Constructs a new render context.
	 */
	constructor() {

		/**
		 * The context's ID.
		 *
		 * @type {Number}
		 */
		this.id = _id ++;

		/**
		 * Whether the current active framebuffer has a color attachment.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.color = true;

		/**
		 * Whether the color attachment should be cleared or not.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.clearColor = true;

		/**
		 * The clear color value.
		 *
		 * @type {Object}
		 * @default true
		 */
		this.clearColorValue = { r: 0, g: 0, b: 0, a: 1 };

		/**
		 * Whether the current active framebuffer has a depth attachment.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.depth = true;

		/**
		 * Whether the depth attachment should be cleared or not.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.clearDepth = true;

		/**
		 * The clear depth value.
		 *
		 * @type {Number}
		 * @default 1
		 */
		this.clearDepthValue = 1;

		/**
		 * Whether the current active framebuffer has a stencil attachment.
		 *
		 * @type {Boolean}
		 * @default false
		 */
		this.stencil = false;

		/**
		 * Whether the stencil attachment should be cleared or not.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.clearStencil = true;

		/**
		 * The clear stencil value.
		 *
		 * @type {Number}
		 * @default 1
		 */
		this.clearStencilValue = 1;

		/**
		 * By default the viewport encloses the entire framebuffer If a smaller
		 * viewport is manually defined, this property is to `true` by the renderer.
		 *
		 * @type {Boolean}
		 * @default false
		 */
		this.viewport = false;

		/**
		 * The viewport value. This value is in physical pixels meaning it incorporates
		 * the renderer's pixel ratio. The viewport property of render targets or
		 * the renderer is in logical pixels.
		 *
		 * @type {Vector4}
		 */
		this.viewportValue = new Vector4();

		/**
		 * When the scissor test is active and scissor rectangle smaller than the
		 * framebuffers dimensions, this property is to `true` by the renderer.
		 *
		 * @type {Boolean}
		 * @default false
		 */
		this.scissor = false;

		/**
		 * The scissor rectangle.
		 *
		 * @type {Vector4}
		 */
		this.scissorValue = new Vector4();

		/**
		 * The textures of the active render target.
		 * `null` when no render target is set.
		 *
		 * @type {Array<Texture>?}
		 * @default null
		 */
		this.textures = null;

		/**
		 * The depth texture of the active render target.
		 * `null` when no render target is set.
		 *
		 * @type {DepthTexture?}
		 * @default null
		 */
		this.depthTexture = null;

		/**
		 * The active cube face.
		 *
		 * @type {Number}
		 * @default 0
		 */
		this.activeCubeFace = 0;

		/**
		 * The number of MSAA samples. This value is always `1` when
		 * MSAA isn't used.
		 *
		 * @type {Number}
		 * @default 1
		 */
		this.sampleCount = 1;

		/**
		 * The framebuffers width in physical pixels.
		 *
		 * @type {Number}
		 * @default 0
		 */
		this.width = 0;

		/**
		 * The framebuffers height in physical pixels.
		 *
		 * @type {Number}
		 * @default 0
		 */
		this.height = 0;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isRenderContext = true;

	}

	/**
	 * Returns the cache key of this render context.
	 *
	 * @return {Number} The cache key.
	 */
	getCacheKey() {

		return getCacheKey( this );

	}

}

/**
 * Computes a cache key for the given render context.
 *
 * @param {RenderContext} renderContext - The render context.
 * @return {Number} The cache key.
 */
export function getCacheKey( renderContext ) {

	const { textures, activeCubeFace } = renderContext;

	const values = [ activeCubeFace ];

	for ( const texture of textures ) {

		values.push( texture.id );

	}

	return hashArray( values );

}

export default RenderContext;
