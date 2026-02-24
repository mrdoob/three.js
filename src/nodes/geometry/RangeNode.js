import Node from '../core/Node.js';
import NodeError from '../core/NodeError.js';
import { getValueType } from '../core/NodeUtils.js';
import { buffer } from '../accessors/BufferNode.js';
import { instancedBufferAttribute } from '../accessors/BufferAttributeNode.js';
import { instanceIndex } from '../core/IndexNode.js';
import { nodeProxy, float } from '../tsl/TSLBase.js';

import { Vector4 } from '../../math/Vector4.js';
import { MathUtils } from '../../math/MathUtils.js';
import { InstancedBufferAttribute } from '../../core/InstancedBufferAttribute.js';

let min = null;
let max = null;

/**
 * `RangeNode` generates random instanced attribute data in a defined range.
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
	getNodeType( builder ) {

		return builder.object.count > 1 ? builder.getTypeFromLength( this.getVectorLength( builder ) ) : 'float';

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

		const object = builder.object;

		let output = null;

		if ( object.count > 1 ) {

			const minNode = this.getConstNode( this.minNode );
			const maxNode = this.getConstNode( this.maxNode );

			const minValue = minNode.value;
			const maxValue = maxNode.value;

			const minLength = builder.getTypeLength( getValueType( minValue ) );
			const maxLength = builder.getTypeLength( getValueType( maxValue ) );

			min = min || new Vector4();
			max = max || new Vector4();

			min.setScalar( 0 );
			max.setScalar( 0 );

			if ( minLength === 1 ) min.setScalar( minValue );
			else if ( minValue.isColor ) min.set( minValue.r, minValue.g, minValue.b, 1 );
			else min.set( minValue.x, minValue.y, minValue.z || 0, minValue.w || 0 );

			if ( maxLength === 1 ) max.setScalar( maxValue );
			else if ( maxValue.isColor ) max.set( maxValue.r, maxValue.g, maxValue.b, 1 );
			else max.set( maxValue.x, maxValue.y, maxValue.z || 0, maxValue.w || 0 );

			const stride = 4;

			const length = stride * object.count;
			const array = new Float32Array( length );

			for ( let i = 0; i < length; i ++ ) {

				const index = i % stride;

				const minElementValue = min.getComponent( index );
				const maxElementValue = max.getComponent( index );

				array[ i ] = MathUtils.lerp( minElementValue, maxElementValue, Math.random() );

			}

			const nodeType = this.getNodeType( builder );
			const uniformBufferSize = object.count * 4 * 4; // count * 4 components * 4 bytes (float)

			if ( uniformBufferSize <= builder.getUniformBufferLimit() ) {

				output = buffer( array, 'vec4', object.count ).element( instanceIndex ).convert( nodeType );

			} else {

				// TODO: Improve anonymous buffer attribute creation removing this part
				const bufferAttribute = new InstancedBufferAttribute( array, 4 );
				builder.geometry.setAttribute( '__range' + this.id, bufferAttribute );

				output = instancedBufferAttribute( bufferAttribute ).convert( nodeType );

			}

		} else {

			output = float( 0 );

		}

		return output;

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
