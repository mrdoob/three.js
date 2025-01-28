import { RenderTarget } from '../../core/RenderTarget.js';

/**
 * A special type of render target that is used when rendering
 * with the WebXR Device API.
 *
 * @private
 * @augments RenderTarget
 */
class XRRenderTarget extends RenderTarget {

	/**
	 * Constructs a new XR render target.
	 *
	 * @param {Number} [width=1] - The width of the render target.
	 * @param {Number} [height=1] - The height of the render target.
	 * @param {Object} [options={}] - The configuration options.
	 */
	constructor( width = 1, height = 1, options = {} ) {

		super( width, height, options );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isXRRenderTarget = true;

		/**
		 * Whether the attachments of the render target
		 * are defined by external textures. This flag is
		 * set to `true` when using the WebXR Layers API.
		 *
		 * @type {Boolean}
		 * @default false
		 */
		this.hasExternalTextures = false;

		/**
		 * Whether a depth buffer should automatically be allocated
		 * for this XR render target or not.
		 *
		 * Allocating a depth buffer is the default behavior of XR render
		 * targets. However, when using the WebXR Layers API, this flag
		 * must be set to `false` when the `ignoreDepthValues` property of
		 * the projection layers evaluates to `false`.
		 *
		 * Reference: {@link https://www.w3.org/TR/webxrlayers-1/#dom-xrprojectionlayer-ignoredepthvalues}.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.autoAllocateDepthBuffer = true;

	}

	copy( source ) {

		super.copy( source );

		this.hasExternalTextures = source.hasExternalTextures;
		this.autoAllocateDepthBuffer = source.autoAllocateDepthBuffer;

		return this;

	}


}

export { XRRenderTarget };
