import Node from '../core/Node.js';
import { float, addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

/** @module RemapNode **/

/**
 * This node allows to remap a node value from one range into another. E.g a value of
 * `0.4` in the range `[ 0.3, 0.5 ]` should be remapped into the normalized range `[ 0, 1 ]`.
 * `RemapNode` takes care of that and converts the original value of `0.4` to `0.5`.
 *
 * @augments Node
 */
class RemapNode extends Node {

	static get type() {

		return 'RemapNode';

	}

	/**
	 * Constructs a new remap node.
	 *
	 * @param {Node} node - The node that should be remapped.
	 * @param {Node} inLowNode - The source or current lower bound of the range.
	 * @param {Node} inHighNode - The source or current upper bound of the range.
	 * @param {Node} [outLowNode=float(0)] - The target lower bound of the range.
	 * @param {Node} [outHighNode=float(1)] - The target upper bound of the range.
	 */
	constructor( node, inLowNode, inHighNode, outLowNode = float( 0 ), outHighNode = float( 1 ) ) {

		super();

		/**
		 * The node that should be remapped.
		 *
		 * @type {Node}
		 */
		this.node = node;

		/**
		 * The source or current lower bound of the range.
		 *
		 * @type {Node}
		 */
		this.inLowNode = inLowNode;

		/**
		 * The source or current upper bound of the range.
		 *
		 * @type {Node}
		 */
		this.inHighNode = inHighNode;

		/**
		 * The target lower bound of the range.
		 *
		 * @type {Node}
		 * @default float(0)
		 */
		this.outLowNode = outLowNode;

		/**
		 * The target upper bound of the range.
		 *
		 * @type {Node}
		 * @default float(1)
		 */
		this.outHighNode = outHighNode;

		/**
		 * Whether the node value should be clamped before
		 * remapping it to the target range.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.doClamp = true;

	}

	setup() {

		const { node, inLowNode, inHighNode, outLowNode, outHighNode, doClamp } = this;

		let t = node.sub( inLowNode ).div( inHighNode.sub( inLowNode ) );

		if ( doClamp === true ) t = t.clamp();

		return t.mul( outHighNode.sub( outLowNode ) ).add( outLowNode );

	}

}

export default RemapNode;

/**
 * TSL function for creating a remap node.
 *
 * @function
 * @param {Node} node - The node that should be remapped.
 * @param {Node} inLowNode - The source or current lower bound of the range.
 * @param {Node} inHighNode - The source or current upper bound of the range.
 * @param {Node} [outLowNode=float(0)] - The target lower bound of the range.
 * @param {Node} [outHighNode=float(1)] - The target upper bound of the range.
 * @returns {RemapNode}
 */
export const remap = /*@__PURE__*/ nodeProxy( RemapNode, null, null, { doClamp: false } );

/**
 * TSL function for creating a remap node, but with enabled clamping.
 *
 * @function
 * @param {Node} node - The node that should be remapped.
 * @param {Node} inLowNode - The source or current lower bound of the range.
 * @param {Node} inHighNode - The source or current upper bound of the range.
 * @param {Node} [outLowNode=float(0)] - The target lower bound of the range.
 * @param {Node} [outHighNode=float(1)] - The target upper bound of the range.
 * @returns {RemapNode}
 */
export const remapClamp = /*@__PURE__*/ nodeProxy( RemapNode );

addMethodChaining( 'remap', remap );
addMethodChaining( 'remapClamp', remapClamp );
