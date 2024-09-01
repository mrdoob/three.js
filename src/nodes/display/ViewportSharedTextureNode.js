import ViewportTextureNode from './ViewportTextureNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { viewportUV } from './ViewportNode.js';

import { FramebufferTexture } from '../../textures/FramebufferTexture.js';

let _sharedFramebuffer = null;

class ViewportSharedTextureNode extends ViewportTextureNode {

	static get type() {

		return 'ViewportSharedTextureNode';

	}

	constructor( uvNode = viewportUV, levelNode = null ) {

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

export const viewportSharedTexture = /*@__PURE__*/ nodeProxy( ViewportSharedTextureNode );
