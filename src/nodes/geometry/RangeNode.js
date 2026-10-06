import Node from '../core/Node.js';
import NodeError from '../core/NodeError.js';
import { getValueType } from '../core/NodeUtils.js';
import { buffer } from '../accessors/BufferNode.js';
import { instancedBufferAttribute } from '../accessors/BufferAttributeNode.js';
import { instanceIndex } from '../core/IndexNode.js';
import { isSharedInstancing } from '../accessors/Instance.js';
import { nodeProxy, float } from '../tsl/TSLBase.js';

import { Vector4 } from '../../math/Vector4.js';
import { lerp } from '../../math/MathUtils.js';
import { InstancedBufferAttribute } from '../../core/InstancedBufferAttribute.js';

/**
 * Returns random values between `min` and `max` for the given number of instances.
 *
 * @private
 * @param {Vector4} min - The lower bound.
 * @param {Vector4} max - The upper bound.
 * @param {number} count - The number of instances.
 * @return {Float32Array} Four values per instance.
 */
function getRandomData( min, max, count ) {

	const array = new Float32Array( count * 4 );

	for ( let i = 0; i < array.length; i ++ ) {

		const index = i % 4;

		array[ i ] = lerp( min.getComponent( index ), max.getComponent( index ), Math.random() );

	}

	return array;

}

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

		/**
		 * The random data of each instanced mesh, for programs shared between instanced meshes.
		 *
		 * @private
		 * @type {WeakMap<InstancedMesh, InstancedBufferAttribute>}
		 */
		this._objectData = new WeakMap();

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

		const object = builder.object;

		return object.count > 1 || isSharedInstancing( object, builder.renderer ) ? builder.getTypeFromLength( this.getVectorLength( builder ) ) : 'float';

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

		if ( object.count > 1 || isSharedInstancing( object, builder.renderer ) ) {

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

			const nodeType = this.getNodeType( builder );

			if ( isSharedInstancing( object, builder.renderer ) ) {

				// Programs shared between instanced meshes read the random data of the rendered mesh.

				const getObjectData = mesh => {

					const count = mesh.instanceMatrix.count;
					let data = this._objectData.get( mesh );

					if ( data === undefined || data.count !== count ) {

						data = new InstancedBufferAttribute( getRandomData( min, max, count ), 4 );
						this._objectData.set( mesh, data );

					}

					return data;

				};

				output = instancedBufferAttribute( getObjectData( object ) ).setObjectAttribute( getObjectData ).convert( nodeType );

			} else {

				const array = getRandomData( min, max, object.count );
				const uniformBufferSize = object.count * 4 * 4; // count * 4 components * 4 bytes (float)

				if ( uniformBufferSize <= builder.getUniformBufferLimit() ) {

					output = buffer( array, 'vec4', object.count ).element( instanceIndex ).convert( nodeType );

				} else {

					// TODO: Improve anonymous buffer attribute creation removing this part
					const bufferAttribute = new InstancedBufferAttribute( array, 4 );
					builder.geometry.setAttribute( '__range' + this.id, bufferAttribute );

					output = instancedBufferAttribute( bufferAttribute ).convert( nodeType );

				}

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
