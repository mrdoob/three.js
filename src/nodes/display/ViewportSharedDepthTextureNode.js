import ViewportDepthTextureNode from './ViewportDepthTextureNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { screenUV } from './ScreenNode.js';

import { DepthTexture } from '../../textures/DepthTexture.js';

let _sharedDepthbuffer = null;

/**
 * `ViewportDepthTextureNode` creates an internal texture for each node instance. This module
 * shares a depth texture across all instances of `ViewportSharedDepthTextureNode`. It should
 * be the first choice when using depth data of the default/screen framebuffer for performance
 * reasons in single-viewport scenarios.
 *
 * @augments ViewportDepthTextureNode
 */
class ViewportSharedDepthTextureNode extends ViewportDepthTextureNode {

	static get type() {

		return 'ViewportSharedDepthTextureNode';

	}

	/**
	 * Constructs a new viewport shared depth texture node.
	 *
	 * @param {Node} [uvNode=screenUV] - The uv node.
	 * @param {?Node} [levelNode=null] - The level node.
	 */
	constructor( uvNode = screenUV, levelNode = null ) {

		if ( _sharedDepthbuffer === null ) {

			_sharedDepthbuffer = new DepthTexture();

		}

		super( uvNode, levelNode, _sharedDepthbuffer );

	}

	/**
	 * Overwritten so the method always returns the unique shared
	 * depth texture.
	 *
	 * @return {DepthTexture} The shared depth texture.
	 */
	getTextureForReference() {

		return _sharedDepthbuffer;

	}

	updateReference() {

		return this;

	}

}

export default ViewportSharedDepthTextureNode;

/**
 * TSL function for creating a shared viewport depth texture node.
 *
 * @tsl
 * @function
 * @param {?Node} [uvNode=screenUV] - The uv node.
 * @param {?Node} [levelNode=null] - The level node.
 * @returns {ViewportSharedDepthTextureNode}
 */
export const viewportSharedDepthTexture = /*@__PURE__*/ nodeProxy( ViewportSharedDepthTextureNode ).setParameterLength( 0, 2 );
