import ViewportTextureNode from './ViewportTextureNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';
import { viewportTopLeft } from './ViewportNode.js';

let rtt = null;

class ViewportSharedTextureNode extends ViewportTextureNode {

	constructor( uv = viewportTopLeft ) {

		super( uv );

	}

	constructRTT( builder ) {

		return rtt || ( rtt = builder.getRenderTarget() );

	}

}

export default ViewportSharedTextureNode;

export const viewportSharedTexture = nodeProxy( ViewportSharedTextureNode );

addNodeElement( 'viewportSharedTexture', viewportSharedTexture );

addNodeClass( ViewportSharedTextureNode );
