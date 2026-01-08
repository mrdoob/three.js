import TextureNode from '../accessors/TextureNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { screenUV } from './ScreenNode.js';

import { Vector2 } from '../../math/Vector2.js';
import { FramebufferTexture } from '../../textures/FramebufferTexture.js';
import { LinearMipmapLinearFilter } from '../../constants.js';

const _size = /*@__PURE__*/ new Vector2();

/**
 * A special type of texture node which represents the data of the current viewport
 * as a texture. The module extracts data from the current bound framebuffer with
 * a copy operation so no extra render pass is required to produce the texture data
 * (which is good for performance). `ViewportTextureNode` can be used as an input for a
 * variety of effects like refractive or transmissive materials.
 *
 * @augments TextureNode
 */
class ViewportTextureNode extends TextureNode {

	static get type() {

		return 'ViewportTextureNode';

	}

	/**
	 * Constructs a new viewport texture node.
	 *
	 * @param {Node} [uvNode=screenUV] - The uv node.
	 * @param {?Node} [levelNode=null] - The level node.
	 * @param {?Texture} [framebufferTexture=null] - A framebuffer texture holding the viewport data. If not provided, a framebuffer texture is created automatically.
	 */
	constructor( uvNode = screenUV, levelNode = null, framebufferTexture = null ) {

		let defaultFramebuffer = null;

		if ( framebufferTexture === null ) {

			defaultFramebuffer = new FramebufferTexture();
			defaultFramebuffer.minFilter = LinearMipmapLinearFilter;

			framebufferTexture = defaultFramebuffer;

		} else {

			defaultFramebuffer = framebufferTexture;

		}

		super( framebufferTexture, uvNode, levelNode );

		/**
		 * Whether to generate mipmaps or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.generateMipmaps = false;

		/**
		 * The reference framebuffer texture. This is used to store the framebuffer texture
		 * for the current render target. If the render target changes, a new framebuffer texture
		 * is created automatically.
		 *
		 * @type {FramebufferTexture}
		 * @default null
		 */
		this.defaultFramebuffer = defaultFramebuffer;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isOutputTextureNode = true;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.RENDER` since the node should extract
		 * the current contents of the bound framebuffer for each render call.
		 *
		 * @type {string}
		 * @default 'render'
		 */
		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	/**
	 * This methods returns a texture for the given render target or canvas target reference.
	 *
	 * To avoid rendering errors, `ViewportTextureNode` must use unique framebuffer textures
	 * for different render contexts.
	 *
	 * @param {?(RenderTarget|CanvasTarget)} [reference=null] - The render target or canvas target reference.
	 * @return {Texture} The framebuffer texture.
	 */
	getTextureForReference( reference = null ) {

		let defaultFramebuffer;

		if ( this.referenceNode ) {

			defaultFramebuffer = this.referenceNode.defaultFramebuffer;

		} else {

			defaultFramebuffer = this.defaultFramebuffer;

		}

		if ( reference === null ) {

			return defaultFramebuffer;

		}

		let cacheTextures = defaultFramebuffer._viewportCache;

		if ( cacheTextures === undefined ) {

			cacheTextures = new WeakMap();
			defaultFramebuffer._viewportCache = cacheTextures;

		}

		if ( cacheTextures.has( reference ) === false ) {

			const framebufferTexture = defaultFramebuffer.clone();

			cacheTextures.set( reference, framebufferTexture );

		}

		return cacheTextures.get( reference );

	}

	updateReference( frame ) {

		const renderer = frame.renderer;
		const renderTarget = renderer.getRenderTarget();
		const canvasTarget = renderer.getCanvasTarget();

		// Use canvasTarget if available, otherwise renderTarget (handles both null and undefined)
		const reference = canvasTarget ? canvasTarget : renderTarget;

		this.value = this.getTextureForReference( reference );

		return this.value;

	}

	updateBefore( frame ) {

		const renderer = frame.renderer;
		const renderTarget = renderer.getRenderTarget();
		const canvasTarget = renderer.getCanvasTarget();

		const reference = canvasTarget ? canvasTarget : renderTarget;

		if ( reference === null ) {

			renderer.getDrawingBufferSize( _size );

		} else if ( reference.getDrawingBufferSize ) {

			reference.getDrawingBufferSize( _size );

		} else {

			_size.set( reference.width, reference.height );

		}

		//

		const framebufferTexture = this.getTextureForReference( reference );

		if ( framebufferTexture.image.width !== _size.width || framebufferTexture.image.height !== _size.height ) {

			framebufferTexture.image.width = _size.width;
			framebufferTexture.image.height = _size.height;
			framebufferTexture.needsUpdate = true;

		}

		//

		const currentGenerateMipmaps = framebufferTexture.generateMipmaps;
		framebufferTexture.generateMipmaps = this.generateMipmaps;

		renderer.copyFramebufferToTexture( framebufferTexture );

		framebufferTexture.generateMipmaps = currentGenerateMipmaps;

	}

	clone() {

		const viewportTextureNode = new this.constructor( this.uvNode, this.levelNode, this.value );
		viewportTextureNode.generateMipmaps = this.generateMipmaps;

		return viewportTextureNode;

	}

}

export default ViewportTextureNode;

/**
 * TSL function for creating a viewport texture node.
 *
 * @tsl
 * @function
 * @param {?Node} [uvNode=screenUV] - The uv node.
 * @param {?Node} [levelNode=null] - The level node.
 * @param {?Texture} [framebufferTexture=null] - A framebuffer texture holding the viewport data. If not provided, a framebuffer texture is created automatically.
 * @returns {ViewportTextureNode}
 */
export const viewportTexture = /*@__PURE__*/ nodeProxy( ViewportTextureNode ).setParameterLength( 0, 3 );

/**
 * TSL function for creating a viewport texture node with enabled mipmap generation.
 *
 * @tsl
 * @function
 * @param {?Node} [uvNode=screenUV] - The uv node.
 * @param {?Node} [levelNode=null] - The level node.
 * @param {?Texture} [framebufferTexture=null] - A framebuffer texture holding the viewport data. If not provided, a framebuffer texture is created automatically.
 * @returns {ViewportTextureNode}
 */
export const viewportMipTexture = /*@__PURE__*/ nodeProxy( ViewportTextureNode, null, null, { generateMipmaps: true } ).setParameterLength( 0, 3 );

// Singleton instances for common usage
const _singletonOpaqueViewportTextureNode = /*@__PURE__*/ viewportMipTexture();

/**
 * TSL function for creating a viewport texture node with enabled mipmap generation.
 * The texture should only contain the opaque rendering objects.
 *
 * This should be used just in transparent or transmissive materials.
 *
 * @tsl
 * @function
 * @param {?Node} [uv=screenUV] - The uv node.
 * @param {?Node} [level=null] - The level node.
 * @returns {ViewportTextureNode}
 */
export const viewportOpaqueMipTexture = ( uv = screenUV, level = null ) => _singletonOpaqueViewportTextureNode.sample( uv, level ); // TODO: Use once() when sample() supports it
