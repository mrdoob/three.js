import ViewportTextureNode from './ViewportTextureNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { viewportTopLeft } from './ViewportNode.js';

import { FramebufferTexture } from '../../textures/FramebufferTexture.js';

let _sharedFramebuffer = null;

class ViewportSharedTextureNode extends ViewportTextureNode {

	constructor( uvNode = viewportTopLeft, levelNode = null ) {

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

export const viewportSharedTexture = nodeProxy( ViewportSharedTextureNode );
