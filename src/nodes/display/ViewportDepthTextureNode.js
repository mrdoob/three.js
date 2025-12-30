import ViewportTextureNode from './ViewportTextureNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { screenUV } from './ScreenNode.js';

import { DepthTexture } from '../../textures/DepthTexture.js';

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
	 * @param {?DepthTexture} [depthTexture=null] - A depth texture. If not provided, a depth texture is created automatically.
	 */
	constructor( uvNode = screenUV, levelNode = null, depthTexture = null ) {

		if ( depthTexture === null ) {

			depthTexture = new DepthTexture();

		}

		super( uvNode, levelNode, depthTexture );

	}

}

export default ViewportDepthTextureNode;

/**
 * TSL function for a viewport depth texture node.
 *
 * @tsl
 * @function
 * @param {?Node} [uvNode=screenUV] - The uv node.
 * @param {?Node} [levelNode=null] - The level node.
 * @param {?DepthTexture} [depthTexture=null] - A depth texture. If not provided, a depth texture is created automatically.
 * @returns {ViewportDepthTextureNode}
 */
export const viewportDepthTexture = /*@__PURE__*/ nodeProxy( ViewportDepthTextureNode ).setParameterLength( 0, 3 );
