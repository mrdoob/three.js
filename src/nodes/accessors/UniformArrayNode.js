import { nodeObject } from '../tsl/TSLBase.js';
import { NodeUpdateType } from '../core/constants.js';
import { getValueType } from '../core/NodeUtils.js';
import ArrayElementNode from '../utils/ArrayElementNode.js';
import BufferNode from './BufferNode.js';

/** @module UniformArrayNode **/

/**
 * Represents the element access on uniform array nodes.
 *
 * @augments ArrayElementNode
 */
class UniformArrayElementNode extends ArrayElementNode {

	static get type() {

		return 'UniformArrayElementNode';

	}

	/**
	 * Constructs a new buffer node.
	 *
	 * @param {UniformArrayNode} uniformArrayNode - The uniform array node to access.
	 * @param {IndexNode} indexNode - The index data that define the position of the accessed element in the array.
	 */
	constructor( uniformArrayNode, indexNode ) {

		super( uniformArrayNode, indexNode );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isArrayBufferElementNode = true;

	}

	generate( builder ) {

		const snippet = super.generate( builder );
		const type = this.getNodeType();
		const paddedType = this.node.getPaddedType();

		return builder.format( snippet, paddedType, type );

	}

}

/**
 * Similar to {@link module:BufferNode~BufferNode} this module represents array-like data as
 * uniform buffers. Unlike {@link module:BufferNode~BufferNode}, it can handle more common
 * data types in the array (e.g `three.js` primitives) and automatically
 * manage buffer padding. It should be the first choice when working with
 * uniforms buffers.
 * ```js
 * const tintColors = uniformArray( [
 * 	new Color( 1, 0, 0 ),
 * 	new Color( 0, 1, 0 ),
 * 	new Color( 0, 0, 1 )
 * ], 'color' );
 *
 * const redColor = tintColors.element( 0 );
 *
 * @augments module:BufferNode~BufferNode
 */
class UniformArrayNode extends BufferNode {

	static get type() {

		return 'UniformArrayNode';

	}

	/**
	 * Constructs a new uniform array node.
	 *
	 * @param {Array<Any>} value - Array holding the buffer data.
	 * @param {String?} [elementType=null] - The data type of a buffer element.
	 */
	constructor( value, elementType = null ) {

		super( null );

		/**
		 * Array holding the buffer data. Unlike {@link module:BufferNode~BufferNode}, the array can
		 * hold number primitives as well as three.js objects like vectors, matrices
		 * or colors.
		 *
		 * @type {Array<Any>}
		 */
		this.array = value;

		/**
		 * The data type of an array element.
		 *
		 * @type {String}
		 */
		this.elementType = elementType === null ? getValueType( value[ 0 ] ) : elementType;

		/**
		 * The padded type. Uniform buffers must conform to a certain buffer layout
		 * so a separate type is computed to ensure correct buffer size.
		 *
		 * @type {String}
		 */
		this.paddedType = this.getPaddedType();

		/**
		 * Overwritten since uniform array nodes are updated per render.
		 *
		 * @type {String}
		 * @default 'render'
		 */
		this.updateType = NodeUpdateType.RENDER;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isArrayBufferNode = true;

	}

	/**
	 * This method is overwritten since the node type is inferred from the
	 * {@link module:UniformArrayNode~UniformArrayNode#paddedType}.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The node type.
	 */
	getNodeType( /*builder*/ ) {

		return this.paddedType;

	}

	/**
	 * The data type of the array elements.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The element type.
	 */
	getElementType() {

		return this.elementType;

	}

	/**
	 * Returns the padded type based on the element type.
	 *
	 * @return {String} The padded type.
	 */
	getPaddedType() {

		const elementType = this.elementType;

		let paddedType = 'vec4';

		if ( elementType === 'mat2' ) {

			paddedType = 'mat2';

		} else if ( /mat/.test( elementType ) === true ) {

			paddedType = 'mat4';

		} else if ( elementType.charAt( 0 ) === 'i' ) {

			paddedType = 'ivec4';

		} else if ( elementType.charAt( 0 ) === 'u' ) {

			paddedType = 'uvec4';

		}

		return paddedType;

	}

	/**
	 * The update makes sure to correctly transfer the data from the (complex) objects
	 * in the array to the internal, correctly padded value buffer.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	update( /*frame*/ ) {

		const { array, value } = this;

		const elementType = this.elementType;

		if ( elementType === 'float' || elementType === 'int' || elementType === 'uint' ) {

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * 4;

				value[ index ] = array[ i ];

			}

		} else if ( elementType === 'color' ) {

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * 4;
				const vector = array[ i ];

				value[ index ] = vector.r;
				value[ index + 1 ] = vector.g;
				value[ index + 2 ] = vector.b || 0;
				//value[ index + 3 ] = vector.a || 0;

			}

		} else if ( elementType === 'mat2' ) {

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * 4;
				const matrix = array[ i ];

				value[ index ] = matrix.elements[ 0 ];
				value[ index + 1 ] = matrix.elements[ 1 ];
				value[ index + 2 ] = matrix.elements[ 2 ];
				value[ index + 3 ] = matrix.elements[ 3 ];

			}

		} else if ( elementType === 'mat3' ) {

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * 16;
				const matrix = array[ i ];

				value[ index ] = matrix.elements[ 0 ];
				value[ index + 1 ] = matrix.elements[ 1 ];
				value[ index + 2 ] = matrix.elements[ 2 ];

				value[ index + 4 ] = matrix.elements[ 3 ];
				value[ index + 5 ] = matrix.elements[ 4 ];
				value[ index + 6 ] = matrix.elements[ 5 ];

				value[ index + 8 ] = matrix.elements[ 6 ];
				value[ index + 9 ] = matrix.elements[ 7 ];
				value[ index + 10 ] = matrix.elements[ 8 ];

				value[ index + 15 ] = 1;

			}

		} else if ( elementType === 'mat4' ) {

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * 16;
				const matrix = array[ i ];

				for ( let i = 0; i < matrix.elements.length; i ++ ) {

					value[ index + i ] = matrix.elements[ i ];

				}

			}

		} else {

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * 4;
				const vector = array[ i ];

				value[ index ] = vector.x;
				value[ index + 1 ] = vector.y;
				value[ index + 2 ] = vector.z || 0;
				value[ index + 3 ] = vector.w || 0;

			}

		}

	}

	/**
	 * Implement the value buffer creation based on the array data.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @return {null}
	 */
	setup( builder ) {

		const length = this.array.length;
		const elementType = this.elementType;

		let arrayType = Float32Array;

		const paddedType = this.paddedType;
		const paddedElementLength = builder.getTypeLength( paddedType );

		if ( elementType.charAt( 0 ) === 'i' ) arrayType = Int32Array;
		if ( elementType.charAt( 0 ) === 'u' ) arrayType = Uint32Array;

		this.value = new arrayType( length * paddedElementLength );
		this.bufferCount = length;
		this.bufferType = paddedType;

		return super.setup( builder );

	}

	/**
	 * Overwrites the default `element()` method to provide element access
	 * based on {@link module:UniformArrayNode~UniformArrayNode}.
	 *
	 * @param {IndexNode} indexNode - The index node.
	 * @return {UniformArrayElementNode}
	 */
	element( indexNode ) {

		return nodeObject( new UniformArrayElementNode( this, nodeObject( indexNode ) ) );

	}

}

export default UniformArrayNode;

/**
 * TSL function for creating an uniform array node.
 *
 * @function
 * @param {Array<Any>} values - Array-like data.
 * @param {String?} nodeType - The data type of the array elements.
 * @returns {UniformArrayNode}
 */
export const uniformArray = ( values, nodeType ) => nodeObject( new UniformArrayNode( values, nodeType ) );

/**
 * @function
 * @deprecated since r168. Use {@link uniformArray} instead.
 *
 * @param {Array<Any>} values - Array-like data.
 * @param {String} nodeType - The data type of the array elements.
 * @returns {UniformArrayNode}
 */
export const uniforms = ( values, nodeType ) => { // @deprecated, r168

	console.warn( 'TSL.UniformArrayNode: uniforms() has been renamed to uniformArray().' );
	return nodeObject( new UniformArrayNode( values, nodeType ) );

};
