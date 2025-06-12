import Node from '../core/Node.js';
import { nodeImmutable, float, Fn } from '../tsl/TSLBase.js';

import { BackSide, DoubleSide, WebGLCoordinateSystem } from '../../constants.js';

/**
 * This node can be used to evaluate whether a primitive is front or back facing.
 *
 * @augments Node
 */
class FrontFacingNode extends Node {

	static get type() {

		return 'FrontFacingNode';

	}

	/**
	 * Constructs a new front facing node.
	 */
	constructor() {

		super( 'bool' );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isFrontFacingNode = true;

	}

	generate( builder ) {

		const { renderer, material } = builder;

		if ( renderer.coordinateSystem === WebGLCoordinateSystem ) {

			if ( material.side === BackSide ) {

				return 'false';

			}

		}

		if ( builder.shaderStage !== 'fragment' ) {

			return 'true';

		}

		return builder.getFrontFacing();

	}

}

export default FrontFacingNode;

/**
 * TSL object that represents whether a primitive is front or back facing
 *
 * @tsl
 * @type {FrontFacingNode<bool>}
 */
export const frontFacing = /*@__PURE__*/ nodeImmutable( FrontFacingNode );

/**
 * TSL object that represents the front facing status as a number instead of a bool.
 * `1` means front facing, `-1` means back facing.
 *
 * @tsl
 * @type {Node<float>}
 */
export const faceDirection = /*@__PURE__*/ float( frontFacing ).mul( 2.0 ).sub( 1.0 );

export const directionToFaceDirection = /*@__PURE__*/ Fn( ( [ direction ], builder ) => {

	const side = builder.material.side;

	if ( side === BackSide ) {

		direction = direction.mul( -1.0 );

	} else if ( side === DoubleSide ) {

		direction = direction.mul( faceDirection );

	}

	return direction;

} );