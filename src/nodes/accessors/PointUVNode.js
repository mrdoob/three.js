import Node, { registerNode } from '../core/Node.js';
import { nodeImmutable } from '../tsl/TSLBase.js';

class PointUVNode extends Node {

	constructor() {

		super( 'vec2' );

		this.isPointUVNode = true;

	}

	generate( /*builder*/ ) {

		return 'vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y )';

	}

}

export default PointUVNode;

PointUVNode.type = /*@__PURE__*/ registerNode( 'PointUV', PointUVNode );

export const pointUV = /*@__PURE__*/ nodeImmutable( PointUVNode );
