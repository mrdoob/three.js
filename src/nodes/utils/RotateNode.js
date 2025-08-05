import TempNode from '../core/TempNode.js';
import { nodeProxy, vec4, mat2, mat4 } from '../tsl/TSLBase.js';
import { cos, sin } from '../math/MathNode.js';

/**
 * Applies a rotation to the given position node.
 *
 * @augments TempNode
 */
class RotateNode extends TempNode {

	static get type() {

		return 'RotateNode';

	}

	/**
	 * Constructs a new rotate node.
	 *
	 * @param {Node} positionNode - The position node.
	 * @param {Node} rotationNode - Represents the rotation that is applied to the position node. Depending
	 * on whether the position data are 2D or 3D, the rotation is expressed a single float value or an Euler value.
	 */
	constructor( positionNode, rotationNode ) {

		super();

		/**
		 * The position node.
		 *
		 * @type {Node}
		 */
		this.positionNode = positionNode;

		/**
		 *  Represents the rotation that is applied to the position node.
		 *  Depending on whether the position data are 2D or 3D, the rotation is expressed a single float value or an Euler value.
		 *
		 * @type {Node}
		 */
		this.rotationNode = rotationNode;

	}

	/**
	 * The type of the {@link RotateNode#positionNode} defines the node's type.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node's type.
	 */
	getNodeType( builder ) {

		return this.positionNode.getNodeType( builder );

	}

	setup( builder ) {

		const { rotationNode, positionNode } = this;

		const nodeType = this.getNodeType( builder );

		if ( nodeType === 'vec2' ) {

			const cosAngle = rotationNode.cos();
			const sinAngle = rotationNode.sin();

			const rotationMatrix = mat2(
				cosAngle, sinAngle,
				sinAngle.negate(), cosAngle
			);

			return rotationMatrix.mul( positionNode );

		} else {

			const rotation = rotationNode;
			const rotationXMatrix = mat4( vec4( 1.0, 0.0, 0.0, 0.0 ), vec4( 0.0, cos( rotation.x ), sin( rotation.x ).negate(), 0.0 ), vec4( 0.0, sin( rotation.x ), cos( rotation.x ), 0.0 ), vec4( 0.0, 0.0, 0.0, 1.0 ) );
			const rotationYMatrix = mat4( vec4( cos( rotation.y ), 0.0, sin( rotation.y ), 0.0 ), vec4( 0.0, 1.0, 0.0, 0.0 ), vec4( sin( rotation.y ).negate(), 0.0, cos( rotation.y ), 0.0 ), vec4( 0.0, 0.0, 0.0, 1.0 ) );
			const rotationZMatrix = mat4( vec4( cos( rotation.z ), sin( rotation.z ).negate(), 0.0, 0.0 ), vec4( sin( rotation.z ), cos( rotation.z ), 0.0, 0.0 ), vec4( 0.0, 0.0, 1.0, 0.0 ), vec4( 0.0, 0.0, 0.0, 1.0 ) );

			return rotationXMatrix.mul( rotationYMatrix ).mul( rotationZMatrix ).mul( vec4( positionNode, 1.0 ) ).xyz;

		}

	}

}

export default RotateNode;

/**
 * TSL function for creating a rotate node.
 *
 * @tsl
 * @function
 * @param {Node} positionNode - The position node.
 * @param {Node} rotationNode - Represents the rotation that is applied to the position node. Depending
 * on whether the position data are 2D or 3D, the rotation is expressed a single float value or an Euler value.
 * @returns {RotateNode}
 */
export const rotate = /*@__PURE__*/ nodeProxy( RotateNode ).setParameterLength( 2 );
