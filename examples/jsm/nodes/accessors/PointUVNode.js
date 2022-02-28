import Node from '../core/Node.js';

class PointUVNode extends Node {

	constructor() {

		super( 'vec2' );

	}

	generate( /*builder*/ ) {

		return 'vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y )';

	}

}

PointUVNode.prototype.isPointUVNode = true;

export default PointUVNode;
