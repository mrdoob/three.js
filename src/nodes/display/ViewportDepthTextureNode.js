import ViewportTextureNode from './ViewportTextureNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { screenUV } from './ScreenNode.js';

import { DepthTexture } from '../../textures/DepthTexture.js';

let sharedDepthbuffer = null;

/**
 * Represents the depth of the current viewport as a texture. This module
 * can be used in combination with viewport texture to achieve effects
 * that require depth evaluation.
 *
 * @augments ViewportTextureNode
 */
class ViewportDepthTextureNode extends ViewportTextureNode {

	static get type() {

		return 'ViewportDepthTextureNode';

	}

	/**
	 * Constructs a new viewport depth texture node.
	 *
	 * @param {Node} [uvNode=screenUV] - The uv node.
	 * @param {?Node} [levelNode=null] - The level node.
	 */
	constructor( uvNode = screenUV, levelNode = null ) {

		if ( sharedDepthbuffer === null ) {

			sharedDepthbuffer = new DepthTexture();

		}

		super( uvNode, levelNode, sharedDepthbuffer );

	}

}

export default ViewportDepthTextureNode;

/**
 * TSL function for a viewport depth texture node.
 *
 * @tsl
 * @function
 * @param {Node} [uvNode=screenUV] - The uv node.
 * @param {?Node} [levelNode=null] - The level node.
 * @returns {ViewportDepthTextureNode}
 */
export const viewportDepthTexture = /*@__PURE__*/ nodeProxy( ViewportDepthTextureNode );
