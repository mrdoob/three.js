import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class PointUVNode extends TempNode {

	constructor() {

		super( 'vec2' );

		this.isPointUVNode = true;

	}

	generate( builder ) {

		if ( builder.isGLSLNodeBuilder !== true ) throw new Error( 'PointUVNode can only be used in WebGL' );

		return 'vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y )';

	}

}

export default PointUVNode;

export const pointUV = nodeImmutable( PointUVNode );

addNodeClass( 'PointUVNode', PointUVNode );
