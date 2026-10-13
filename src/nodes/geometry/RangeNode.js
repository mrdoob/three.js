import Node from '../core/Node.js';
import NodeError from '../core/NodeError.js';
import { getValueType } from '../core/NodeUtils.js';
import { instanceIndex } from '../core/IndexNode.js';
import { uniform } from '../core/UniformNode.js';
import { hash } from '../math/Hash.js';
import { mix } from '../math/MathNode.js';
import { nodeProxy, float, uint, vec4 } from '../tsl/TSLBase.js';

import { Vector4 } from '../../math/Vector4.js';

let _rangeId = 0;

// Per-object seed shared by all range nodes, so the values differ between objects.

const objectSeed = /*@__PURE__*/ uniform( 0, 'uint' ).onObjectUpdate( ( { object } ) => {

	const objectId = object !== null ? object.id : 0; // compute has no object

	return Math.imul( objectId, 0x9E3779B9 ) >>> 0;

} );

/**
 * `RangeNode` generates random per-instance values in a defined range.
 * An exemplary use case for this utility node is to generate random per-instance
 * colors:
 * ```js
 * const material = new MeshBasicNodeMaterial();
 * material.colorNode = range( new Color( 0x000000 ), new Color( 0xFFFFFF ) );
 * const mesh = new InstancedMesh( geometry, material, count );
 * ```
 * @augments Node
 */
class RangeNode extends Node {

	static get type() {

		return 'RangeNode';

	}

	/**
	 * Constructs a new range node.
	 *
	 * @param {Node<any>} [minNode=float()] - A node defining the lower bound of the range.
	 * @param {Node<any>} [maxNode=float()] - A node defining the upper bound of the range.
	 */
	constructor( minNode = float(), maxNode = float() ) {

		super();

		/**
		 *  A node defining the lower bound of the range.
		 *
		 * @type {Node<any>}
		 * @default float()
		 */
		this.minNode = minNode;

		/**
		 *  A node defining the upper bound of the range.
		 *
		 * @type {Node<any>}
		 * @default float()
		 */
		this.maxNode = maxNode;

		/**
		 * Salt of the random sequence. It uses a counter of range nodes instead of the
		 * global node id, so the values only change when range nodes are added or removed.
		 *
		 * @private
		 * @type {number}
		 */
		this._salt = Math.imul( _rangeId ++, 0x85EBCA6B ) >>> 0;

	}

	isCacheable( /*builder*/ ) {

		return false;

	}

	/**
	 * Returns the vector length which is computed based on the range definition.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {number} The vector length.
	 */
	getVectorLength( builder ) {

		const minNode = this.getConstNode( this.minNode );
		const maxNode = this.getConstNode( this.maxNode );

		const minLength = builder.getTypeLength( getValueType( minNode.value ) );
		const maxLength = builder.getTypeLength( getValueType( maxNode.value ) );

		return minLength > maxLength ? minLength : maxLength;

	}

	/**
	 * This method is overwritten since the node type is inferred from range definition.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
	generateNodeType( builder ) {

		return builder.getTypeFromLength( this.getVectorLength( builder ) );

	}

	/**
	 * Returns a constant node from the given node by traversing it.
	 *
	 * @param {Node} node - The node to traverse.
	 * @returns {Node} The constant node, if found.
	 */
	getConstNode( node ) {

		let output = null;

		node.traverse( n => {

			if ( n.isConstNode === true ) {

				output = n;

			}

		} );

		if ( output === null ) {

			throw new NodeError( 'THREE.TSL: No "ConstNode" found in node graph.', this.stackTrace );

		}

		return output;

	}

	setup( builder ) {

		const minNode = this.getConstNode( this.minNode );
		const maxNode = this.getConstNode( this.maxNode );

		const minValue = minNode.value;
		const maxValue = maxNode.value;

		const minLength = builder.getTypeLength( getValueType( minValue ) );
		const maxLength = builder.getTypeLength( getValueType( maxValue ) );

		const min = new Vector4();
		const max = new Vector4();

		if ( minLength === 1 ) min.setScalar( minValue );
		else if ( minValue.isColor ) min.set( minValue.r, minValue.g, minValue.b, 1 );
		else min.set( minValue.x, minValue.y, minValue.z || 0, minValue.w || 0 );

		if ( maxLength === 1 ) max.setScalar( maxValue );
		else if ( maxValue.isColor ) max.set( maxValue.r, maxValue.g, maxValue.b, 1 );
		else max.set( maxValue.x, maxValue.y, maxValue.z || 0, maxValue.w || 0 );

		// The values are hashed from the instance index instead of stored per object, so they work
		// for any instance count. The salt decorrelates range nodes.

		const seed = objectSeed.bitXor( uint( this._salt ) );

		const index = instanceIndex.mul( 4 ).add( seed );
		const random = vec4( hash( index ), hash( index.add( 1 ) ), hash( index.add( 2 ) ), hash( index.add( 3 ) ) );

		return mix( vec4( min ), vec4( max ), random ).convert( this.getNodeType( builder ) );

	}

}

export default RangeNode;

/**
 * TSL function for creating a range node.
 *
 * @tsl
 * @function
 * @param {Node<any>} [minNode=float()] - A node defining the lower bound of the range.
 * @param {Node<any>} [maxNode=float()] - A node defining the upper bound of the range.
 * @returns {RangeNode}
 */
export const range = /*@__PURE__*/ nodeProxy( RangeNode ).setParameterLength( 2 );
