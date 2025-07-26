import Node from '../core/Node.js';
import { nodeImmutable } from '../tsl/TSLBase.js';

/**
 * A node for representing the uv coordinates of points.
 *
 * Can only be used with a WebGL backend. In WebGPU, point
 * primitives always have the size of one pixel and can thus
 * can't be used as sprite-like objects that display textures.
 *
 * @augments Node
 */
class PointUVNode extends Node {

	static get type() {

		return 'PointUVNode';

	}

	/**
	 * Constructs a new point uv node.
	 */
	constructor() {

		super( 'vec2' );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isPointUVNode = true;

	}

	generate( /*builder*/ ) {

		return 'vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y )';

	}

}

export default PointUVNode;

/**
 * TSL object that represents the uv coordinates of points.
 *
 * @tsl
 * @type {PointUVNode}
 */
export const pointUV = /*@__PURE__*/ nodeImmutable( PointUVNode );
