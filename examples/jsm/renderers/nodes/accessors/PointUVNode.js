import Node from '../core/Node.js';

class PointUVNode extends Node {

	constructor() {

		super( 'vec2' );

		Object.defineProperty( this, 'isPointUVNode', { value: true } );

	}

	generate( builder, output ) {

		const type = this.getType( builder );
		const snippet = 'vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y )';

		return builder.format( snippet, type, output );

	}

}

export default PointUVNode;
