import ViewportTextureNode from './ViewportTextureNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { viewportTopLeft } from './ViewportNode.js';
import { FramebufferTexture } from 'three';

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

addNodeElement( 'viewportSharedTexture', viewportSharedTexture );

addNodeClass( 'ViewportSharedTextureNode', ViewportSharedTextureNode );
