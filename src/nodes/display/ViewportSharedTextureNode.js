import ViewportTextureNode from './ViewportTextureNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { screenUV } from './ScreenNode.js';

import { FramebufferTexture } from '../../textures/FramebufferTexture.js';

let _sharedFramebuffer = null;

/**
 * `ViewportTextureNode` creates an internal texture for each node instance. This module
 * shares a texture across all instances of `ViewportSharedTextureNode`. It should
 * be the first choice when using data of the default/screen framebuffer for performance reasons.
 *
 * @augments ViewportTextureNode
 */
class ViewportSharedTextureNode extends ViewportTextureNode {

	static get type() {

		return 'ViewportSharedTextureNode';

	}

	/**
	 * Constructs a new viewport shared texture node.
	 *
	 * @param {Node} [uvNode=screenUV] - The uv node.
	 * @param {?Node} [levelNode=null] - The level node.
	 */
	constructor( uvNode = screenUV, levelNode = null ) {

		if ( _sharedFramebuffer === null ) {

			_sharedFramebuffer = new FramebufferTexture();

		}

		super( uvNode, levelNode, _sharedFramebuffer );

	}

	updateReference() {

		return this;

	}

}

export default ViewportSharedTextureNode;

/**
 * TSL function for creating a shared viewport texture node.
 *
 * @tsl
 * @function
 * @param {?Node} [uvNode=screenUV] - The uv node.
 * @param {?Node} [levelNode=null] - The level node.
 * @returns {ViewportSharedTextureNode}
 */
export const viewportSharedTexture = /*@__PURE__*/ nodeProxy( ViewportSharedTextureNode ).setParameterLength( 0, 2 );
