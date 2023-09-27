import ViewportTextureNode from './ViewportTextureNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { viewportTopLeft } from './ViewportNode.js';
import { DepthTexture, LinearMipmapLinearFilter, DepthFormat, UnsignedIntType } from 'three';

let sharedDepthbuffer = null;

class ViewportDepthTextureNode extends ViewportTextureNode {

	constructor( uvNode = viewportTopLeft, levelNode = null ) {

		if ( sharedDepthbuffer === null ) {

			sharedDepthbuffer = new DepthTexture();
			sharedDepthbuffer.minFilter = LinearMipmapLinearFilter;
			sharedDepthbuffer.type = UnsignedIntType;
			sharedDepthbuffer.format = DepthFormat;

		}

		super( uvNode, levelNode, sharedDepthbuffer );

	}

}

export default ViewportDepthTextureNode;

export const viewportDepthTexture = nodeProxy( ViewportDepthTextureNode );

addNodeElement( 'viewportDepthTexture', viewportDepthTexture );

addNodeClass( ViewportDepthTextureNode );
