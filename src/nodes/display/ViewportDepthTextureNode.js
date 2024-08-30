import { registerNode } from '../core/Node.js';
import ViewportTextureNode from './ViewportTextureNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { viewportUV } from './ViewportNode.js';

import { DepthTexture } from '../../textures/DepthTexture.js';

let sharedDepthbuffer = null;

class ViewportDepthTextureNode extends ViewportTextureNode {

	constructor( uvNode = viewportUV, levelNode = null ) {

		if ( sharedDepthbuffer === null ) {

			sharedDepthbuffer = new DepthTexture();

		}

		super( uvNode, levelNode, sharedDepthbuffer );

	}

}

export default ViewportDepthTextureNode;

ViewportDepthTextureNode.type = /*@__PURE__*/ registerNode( 'ViewportDepthTexture', ViewportDepthTextureNode );

export const viewportDepthTexture = /*@__PURE__*/ nodeProxy( ViewportDepthTextureNode );
