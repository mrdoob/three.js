import { nodeObject } from '../tsl/TSLBase.js';
import { NodeUpdateType } from '../core/constants.js';
import { getValueType } from '../core/NodeUtils.js';
import ArrayElementNode from '../utils/ArrayElementNode.js';
import BufferNode from './BufferNode.js';

/**
 * Writes a single value into a buffer at the given offset, using the buffer
 * layout of the given type.
 *
 * @private
 * @param {TypedArray} buffer - The buffer to write into.
 * @param {number} offset - The write position in 4-byte elements.
 * @param {any} data - The value to write (a primitive, vector, color or matrix).
 * @param {string} type - The data type of the value.
 */
function setBufferValue( buffer, offset, data, type ) {

	if ( type === 'float' || type === 'int' || type === 'uint' ) {

		buffer[ offset ] = data;
		return;

	}

	if ( type === 'color' || data.isColor === true ) {

		buffer[ offset ] = data.r;
		buffer[ offset + 1 ] = data.g;
		buffer[ offset + 2 ] = data.b || 0;
		return;

	}

	if ( type === 'mat2' ) {

		buffer[ offset ] = data.elements[ 0 ];
		buffer[ offset + 1 ] = data.elements[ 1 ];
		buffer[ offset + 2 ] = data.elements[ 2 ];
		buffer[ offset + 3 ] = data.elements[ 3 ];
		return;

	}

	if ( type === 'mat3' ) {

		buffer[ offset ] = data.elements[ 0 ];
		buffer[ offset + 1 ] = data.elements[ 1 ];
		buffer[ offset + 2 ] = data.elements[ 2 ];

		buffer[ offset + 4 ] = data.elements[ 3 ];
		buffer[ offset + 5 ] = data.elements[ 4 ];
		buffer[ offset + 6 ] = data.elements[ 5 ];

		buffer[ offset + 8 ] = data.elements[ 6 ];
		buffer[ offset + 9 ] = data.elements[ 7 ];
		buffer[ offset + 10 ] = data.elements[ 8 ];

		buffer[ offset + 15 ] = 1;
		return;

	}

	if ( type === 'mat4' ) {

		for ( let i = 0; i < data.elements.length; i ++ ) {

			buffer[ offset + i ] = data.elements[ i ];

		}

		return;

	}


	buffer[ offset ] = data.x;
	buffer[ offset + 1 ] = data.y;
	buffer[ offset + 2 ] = data.z || 0;
	buffer[ offset + 3 ] = data.w || 0;

}

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
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isArrayBufferElementNode = true;

	}

	getMemberType( builder, name ) {

		const structTypeNode = this.node.structTypeNode;

		if ( structTypeNode ) {

			return structTypeNode.getMemberType( builder, name );

		}

		return 'void';

	}

	generate( builder, output ) {

		const snippet = super.generate( builder );
		const type = this.getNodeType( builder );
		const paddedType = this.node.getPaddedType( builder );

		if ( this.node.structTypeNode ) {

			return builder.format( snippet, type, output );

		}

		return builder.format( snippet, paddedType, type );

	}

}

/**
 * Similar to {@link BufferNode} this module represents array-like data as
 * uniform buffers. Unlike {@link BufferNode}, it can handle more common
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
 * @augments BufferNode
 */
class UniformArrayNode extends BufferNode {

	static get type() {

		return 'UniformArrayNode';

	}

	/**
	 * Constructs a new uniform array node.
	 *
	 * @param {Array<any>} value - Array holding the buffer data.
	 * @param {?(string|Struct)} [elementType=null] - The element type (e.g. `'vec3'`).
	 */
	constructor( value, elementType = null ) {

		let structTypeNode = null;

		if ( elementType && elementType.isStructTypeNode ) {

			structTypeNode = elementType;

		}

		super( null );

		/**
		 * Array holding the buffer data. Unlike {@link BufferNode}, the array can
		 * hold number primitives as well as three.js objects like vectors, matrices
		 * or colors.
		 *
		 * @type {Array<any>}
		 */
		this.array = value;

		/**
		 * The data type of an array element.
		 *
		 * @type {string}
		 */
		this.elementType = structTypeNode !== null ? 'struct' : ( elementType === null ? getValueType( value[ 0 ] ) : elementType );

		/**
		 * Overwritten since uniform array nodes are updated per render.
		 *
		 * @type {string}
		 * @default 'render'
		 */
		this.updateType = NodeUpdateType.RENDER;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isArrayBufferNode = true;

		/**
		 * The uniform buffer struct type.
		 *
		 * @type {?StructTypeNode}
		 * @default null
		 */
		this.structTypeNode = structTypeNode;

	}

	/**
	 * This method is overwritten since the node type is inferred from the
	 * padded type.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
	generateNodeType( builder ) {

		if ( this.structTypeNode !== null ) {

			return this.structTypeNode.getNodeType( builder );

		}

		return this.getPaddedType( builder );

	}

	/**
	 * Returns the padded type based on the element type.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The padded type.
	 */
	getPaddedType( builder ) {

		const elementType = this.elementType;

		let paddedType = 'vec4';

		if ( elementType === 'mat2' ) {

			paddedType = builder.renderer.backend.isWebGLBackend === true ? 'vec4' : 'mat2';

		} else if ( /mat/.test( elementType ) === true ) {

			paddedType = 'mat4';

		} else if ( elementType.charAt( 0 ) === 'i' ) {

			paddedType = 'ivec4';

		} else if ( elementType.charAt( 0 ) === 'u' ) {

			paddedType = 'uvec4';

		}

		return paddedType;

	}

	update( /*frame*/ ) {

		this.updateBuffer();

	}

	/**
	 * Composes a user-defined update with the buffer transfer.
	 *
	 * @param {Function} callback - The update function.
	 * @param {string} updateType - The update type.
	 * @return {UniformArrayNode} A reference to this node.
	 */
	onUpdate( callback, updateType ) {

		callback = callback.bind( this );

		return super.onUpdate( ( frame, self ) => {

			callback( frame, self );

			this.updateBuffer();

		}, updateType );

	}

	/**
	 * The method makes sure to correctly transfer the data from the (complex) objects
	 * in the array to the internal, correctly padded value buffer.
	 */
	updateBuffer() {

		const { array, value, elementType, structTypeNode } = this;

		if ( structTypeNode !== null ) {

			const { membersLayout, structLength } = structTypeNode;

			for ( let i = 0; i < array.length; i ++ ) {

				const index = i * structLength;
				const element = array[ i ];

				for ( const member of membersLayout ) {

					setBufferValue( value, index + member.offset, element[ member.name ], member.type );

				}

			}

			return;

		}

		const stride = ( this.elementType === 'mat4' || this.elementType === 'mat3' ) ? 16 : 4;

		for ( let i = 0; i < array.length; i ++ ) {

			setBufferValue( value, i * stride, array[ i ], elementType );

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

		const paddedType = this.getPaddedType( builder );
		const paddedElementLength = this.structTypeNode !== null ? this.structTypeNode.structLength : builder.getTypeLength( paddedType );

		if ( elementType.charAt( 0 ) === 'i' ) arrayType = Int32Array;
		if ( elementType.charAt( 0 ) === 'u' ) arrayType = Uint32Array;

		this.value = new arrayType( length * paddedElementLength );
		this.bufferCount = length;
		this.bufferType = paddedType;

		this.updateBuffer(); // initialize the buffer values

		return super.setup( builder );

	}

	/**
	 * Overwrites the default `element()` method to provide element access
	 * based on {@link UniformArrayNode}.
	 *
	 * @param {IndexNode} indexNode - The index node.
	 * @return {UniformArrayElementNode}
	 */
	element( indexNode ) {

		return new UniformArrayElementNode( this, nodeObject( indexNode ) );

	}

}

export default UniformArrayNode;

/**
 * TSL function for creating an uniform array node.
 *
 * @tsl
 * @function
 * @param {Array<any>} values - Array-like data.
 * @param {?string} [nodeType] - The data type of the array elements.
 * @returns {UniformArrayNode}
 */
export const uniformArray = ( values, nodeType ) => new UniformArrayNode( values, nodeType );
