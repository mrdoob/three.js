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

		/**
		 * The framebuffer texture for the current renderer context.
		 *
		 * @type {Map<(RenderTarget|CanvasTarget), FramebufferTexture>}
		 * @private
		 */
		this._cacheTextures = new Map();

		/**
		 * Disposes the framebuffer texture of a disposed render target or canvas target.
		 *
		 * @type {Function}
		 * @private
		 */
		this._onReferenceDispose = ( event ) => {

			const reference = event.target;

			reference.removeEventListener( 'dispose', this._onReferenceDispose );

			this._cacheTextures.get( reference ).dispose();
			this._cacheTextures.delete( reference );

		};

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

		const node = this.referenceNode ? this.referenceNode : this;

		if ( reference === null ) {

			return node.defaultFramebuffer;

		}

		let framebufferTexture = node._cacheTextures.get( reference );

		if ( framebufferTexture === undefined ) {

			framebufferTexture = node.defaultFramebuffer.clone();

			node._cacheTextures.set( reference, framebufferTexture );

			reference.addEventListener( 'dispose', node._onReferenceDispose );

		}

		return framebufferTexture;

	}

	updateReference( frame ) {

		const renderer = frame.renderer;
		const renderTarget = renderer.getRenderTarget();
		const canvasTarget = renderer.getCanvasTarget();

		const reference = renderTarget ? renderTarget : canvasTarget;

		this.value = this.getTextureForReference( reference );

		return this.value;

	}

	updateBefore( frame ) {

		const renderer = frame.renderer;

		// do not copy during precompilation

		if ( renderer._precompilationState !== null ) return false;

		const renderTarget = renderer.getRenderTarget();
		const canvasTarget = renderer.getCanvasTarget();

		const reference = renderTarget ? renderTarget : canvasTarget;

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

	/**
	 * Frees internal resources. Should be called when the node is no longer in use.
	 */
	dispose() {

		super.dispose();

		for ( const [ reference, framebufferTexture ] of this._cacheTextures ) {

			reference.removeEventListener( 'dispose', this._onReferenceDispose );

			framebufferTexture.dispose();

		}

		this._cacheTextures.clear();

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
