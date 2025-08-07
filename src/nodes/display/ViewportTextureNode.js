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
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders the
		 * scene once per frame in its {@link ViewportTextureNode#updateBefore} method.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * The framebuffer texture for the current renderer context.
		 *
		 * @type {WeakMap<RenderTarget, FramebufferTexture>}
		 * @private
		 */
		this._cacheTextures = new WeakMap();

	}

	/**
	 * This methods returns a texture for the given render target reference.
	 *
	 * To avoid rendering errors, `ViewportTextureNode` must use unique framebuffer textures
	 * for different render contexts.
	 *
	 * @param {?RenderTarget} [reference=null] - The render target reference.
	 * @return {Texture} The framebuffer texture.
	 */
	getTextureForReference( reference = null ) {

		let defaultFramebuffer;
		let cacheTextures;

		if ( this.referenceNode ) {

			defaultFramebuffer = this.referenceNode.defaultFramebuffer;
			cacheTextures = this.referenceNode._cacheTextures;

		} else {

			defaultFramebuffer = this.defaultFramebuffer;
			cacheTextures = this._cacheTextures;

		}

		if ( reference === null ) {

			return defaultFramebuffer;

		}

		if ( cacheTextures.has( reference ) === false ) {

			const framebufferTexture = defaultFramebuffer.clone();

			cacheTextures.set( reference, framebufferTexture );

		}

		return cacheTextures.get( reference );

	}

	updateReference( frame ) {

		const renderTarget = frame.renderer.getRenderTarget();

		this.value = this.getTextureForReference( renderTarget );

		return this.value;

	}

	updateBefore( frame ) {

		const renderer = frame.renderer;
		const renderTarget = renderer.getRenderTarget();

		if ( renderTarget === null ) {

			renderer.getDrawingBufferSize( _size );

		} else {

			_size.set( renderTarget.width, renderTarget.height );

		}

		//

		const framebufferTexture = this.getTextureForReference( renderTarget );

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
