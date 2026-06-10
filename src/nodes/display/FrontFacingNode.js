import Node from '../core/Node.js';
import { nodeImmutable, float, Fn } from '../tsl/TSLBase.js';
import { warnOnce } from '../../utils.js';

import { BackSide, DoubleSide } from '../../constants.js';

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

		if ( builder.shaderStage !== 'fragment' ) return 'true';

		//

		const { material } = builder;

		if ( material.side === BackSide ) {

			return 'false';

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

/**
 * Negates a vector if the rendering occurs on the back side of a face,
 * based on the material's side configuration.
 *
 * - If the material's side is `BackSide`, the vector is inverted (negated).
 * - If the material's side is `DoubleSide`, the vector is multiplied by `faceDirection`
 *   (negated only for back-facing fragments).
 * - If the material's side is `FrontSide` (default), the vector remains unchanged.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} vector - The vector to process.
 * @returns {Node<vec3>} The processed vector.
 */
export const negateOnBackSide = /*@__PURE__*/ Fn( ( [ vector ], { material } ) => {

	const side = material.side;

	if ( side === BackSide ) {

		vector = vector.mul( - 1.0 );

	} else if ( side === DoubleSide ) {

		vector = vector.mul( faceDirection );

	}

	return vector;

} );

/**
 * Negates a vector if the rendering occurs on the back side of a face,
 * based on the material's side configuration.
 *
 * - If the material's side is `BackSide`, the vector is inverted (negated).
 * - If the material's side is `DoubleSide`, the vector is multiplied by `faceDirection`
 *   (negated only for back-facing fragments).
 * - If the material's side is `FrontSide` (default), the vector remains unchanged.
 *
 * @tsl
 * @function
 * @deprecated since r185. Use {@link negateOnBackSide} instead.
 * @param {Node<vec3>} vector - The vector to convert.
 * @returns {Node<vec3>} The converted vector.
 */
export const directionToFaceDirection = ( vector ) => {

	warnOnce( 'TSL: "directionToFaceDirection()" has been renamed to "negateOnBackSide()".' ); // @deprecated r185

	return negateOnBackSide( vector );

};

