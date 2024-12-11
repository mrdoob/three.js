import Node from '../core/Node.js';
import { nodeImmutable, float } from '../tsl/TSLBase.js';

import { BackSide, WebGLCoordinateSystem } from '../../constants.js';

/** @module FrontFacingNode **/

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
		 * @type {Boolean}
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

		return builder.getFrontFacing();

	}

}

export default FrontFacingNode;

/**
 * TSL object that represents whether a primitive is front or back facing
 *
 * @type {FrontFacingNode<bool>}
 */
export const frontFacing = /*@__PURE__*/ nodeImmutable( FrontFacingNode );

/**
 * TSL object that represents the front facing status as a number instead of a bool.
 * `1` means front facing, `-1` means back facing.
 *
 * @type {Node<float>}
 */
export const faceDirection = /*@__PURE__*/ float( frontFacing ).mul( 2.0 ).sub( 1.0 );
