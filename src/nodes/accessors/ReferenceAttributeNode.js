import Node from '../core/Node.js';
import BufferAttributeNode from './BufferAttributeNode.js';
import { storage } from './StorageBufferNode.js';
import { instanceIndex, vertexIndex } from '../core/IndexNode.js';
import { mat3, mat4 } from '../tsl/TSLBase.js';
import { getLengthFromType } from '../core/NodeUtils.js';

import { InterleavedBuffer } from '../../core/InterleavedBuffer.js';
import { InterleavedBufferAttribute } from '../../core/InterleavedBufferAttribute.js';

const _columns = /*@__PURE__*/ new WeakMap();

/**
 * Exposes a buffer attribute with an item size larger than four, like the matrices of an
 * instanced mesh, as an interleaved buffer so its columns can be bound as vertex attributes.
 * The version, usage and update ranges are the ones of the attribute.
 *
 * @private
 * @augments InterleavedBuffer
 */
class AttributeColumnBuffer extends InterleavedBuffer {

	/**
	 * Constructs a new attribute column buffer.
	 *
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 */
	constructor( attribute ) {

		super( attribute.array, attribute.itemSize );

		/**
		 * The buffer attribute.
		 *
		 * @type {BufferAttribute}
		 */
		this.attribute = attribute;

		/**
		 * Whether the buffer is instanced or not.
		 *
		 * @type {boolean}
		 */
		this.isInstancedInterleavedBuffer = attribute.isInstancedBufferAttribute === true;

		/**
		 * See {@link InstancedInterleavedBuffer#meshPerAttribute}.
		 *
		 * @type {number}
		 */
		this.meshPerAttribute = attribute.meshPerAttribute || 1;

	}

	get version() {

		return this.attribute.version;

	}

	set version( value ) {}

	get usage() {

		return this.attribute.usage;

	}

	set usage( value ) {}

	get updateRanges() {

		return this.attribute.updateRanges;

	}

	set updateRanges( value ) {}

}

/**
 * Returns a column of the given buffer attribute.
 *
 * @private
 * @param {BufferAttribute} attribute - The buffer attribute.
 * @param {number} itemSize - The item size of the column.
 * @param {number} offset - The offset of the column.
 * @return {InterleavedBufferAttribute} The column.
 */
function getAttributeColumn( attribute, itemSize, offset ) {

	let columns = _columns.get( attribute );

	if ( columns === undefined || columns.buffer.array !== attribute.array ) {

		columns = { buffer: new AttributeColumnBuffer( attribute ) };

		_columns.set( attribute, columns );

	}

	return columns[ offset ] || ( columns[ offset ] = new InterleavedBufferAttribute( columns.buffer, itemSize, offset ) );

}

/**
 * A buffer attribute node that binds the attribute of the rendered object
 * referred to by a {@link ReferenceAttributeNode}.
 *
 * @private
 * @augments BufferAttributeNode
 */
class ReferenceBufferAttributeNode extends BufferAttributeNode {

	static get type() {

		return 'ReferenceBufferAttributeNode';

	}

	/**
	 * Constructs a new reference buffer attribute node.
	 *
	 * @param {ReferenceAttributeNode} referenceNode - The reference attribute node.
	 * @param {string} bufferType - The buffer type (e.g. `'vec3'`).
	 * @param {number} [bufferStride=0] - The buffer stride, when binding a column of the attribute.
	 * @param {number} [bufferOffset=0] - The buffer offset, when binding a column of the attribute.
	 */
	constructor( referenceNode, bufferType, bufferStride = 0, bufferOffset = 0 ) {

		super( null, bufferType, bufferStride, bufferOffset );

		/**
		 * The reference attribute node.
		 *
		 * @type {ReferenceAttributeNode}
		 */
		this.referenceNode = referenceNode;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isReferenceBufferAttributeNode = true;

	}

	/**
	 * Overwritten since the node has no attribute data of its own.
	 *
	 * @return {string} The hash.
	 */
	getHash() {

		return String( this.id );

	}

	/**
	 * Returns the referred attribute of the given object, or its column.
	 *
	 * @param {Object3D} object - The rendered object.
	 * @return {?(BufferAttribute|InterleavedBufferAttribute)} The buffer attribute.
	 */
	getObjectAttribute( object ) {

		const attribute = this.referenceNode.getAttribute( object );

		if ( ! attribute || this.bufferStride === 0 ) return attribute;

		return getAttributeColumn( attribute, getLengthFromType( this.bufferType ), this.bufferOffset );

	}

	/**
	 * The attribute of the object the program is built for defines the layout.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setup( builder ) {

		this.attribute = this.getObjectAttribute( builder.object );

	}

}

/**
 * This node binds a buffer attribute that is a property of the rendered object, like the
 * matrices of an instanced mesh. Unlike {@link BufferAttributeNode}, the attribute isn't part
 * of the program: each object binds its own attribute, so objects can share a program.
 * ```js
 * const matrix = referenceAttribute( 'instanceMatrix', 'mat4' );
 * const color = referenceAttribute( 'instanceColor' );
 * ```
 * Matrices are bound as columns. Storage buffer attributes are bound as storage buffers.
 *
 * @augments Node
 */
class ReferenceAttributeNode extends Node {

	static get type() {

		return 'ReferenceAttributeNode';

	}

	/**
	 * Constructs a new reference attribute node.
	 *
	 * @param {string} property - The name of the property the node refers to.
	 * @param {?string} [nodeType=null] - The node type. Inferred from the attribute if not set.
	 * @param {?Object} [object=null] - The object the property belongs to. The rendered object if not set.
	 */
	constructor( property, nodeType = null, object = null ) {

		super( nodeType );

		/**
		 * The name of the property the node refers to.
		 *
		 * @type {string}
		 */
		this.property = property;

		/**
		 * The property name might have dots so nested properties can be referred.
		 * The hierarchy of the names is stored inside this array.
		 *
		 * @type {Array<string>}
		 */
		this.properties = property.split( '.' );

		/**
		 * The object the property belongs to. If `null`, the rendered object is used.
		 *
		 * @type {?Object}
		 * @default null
		 */
		this.object = object;

	}

	/**
	 * Returns the value of the referred property of the given object.
	 *
	 * @param {Object} object - The object.
	 * @return {?(BufferAttribute|InterleavedBufferAttribute)} The value of the referred property.
	 */
	getValueFromReference( object ) {

		let value = object;

		for ( const property of this.properties ) {

			if ( value === undefined || value === null ) break;

			value = value[ property ];

		}

		return value;

	}

	/**
	 * Returns the attribute the node binds when rendering the given object.
	 *
	 * @param {Object3D} object - The rendered object.
	 * @return {?(BufferAttribute|InterleavedBufferAttribute)} The buffer attribute.
	 */
	getAttribute( object ) {

		return this.getValueFromReference( this.object !== null ? this.object : object );

	}

	/**
	 * Returns the node type, inferred from the attribute if not set.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
	generateNodeType( builder ) {

		if ( this.nodeType !== null ) return this.nodeType;

		const attribute = this.getAttribute( builder.object );

		return attribute ? builder.getTypeFromAttribute( attribute ) : 'float';

	}

	/**
	 * Sets up the attribute nodes.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node} The attribute node.
	 */
	setup( builder ) {

		const attribute = this.getAttribute( builder.object );

		if ( ! attribute ) throw new Error( `THREE.ReferenceAttributeNode: Attribute "${ this.property }" not found.` );

		const type = this.getNodeType( builder );

		if ( attribute.isStorageBufferAttribute === true || attribute.isStorageInstancedBufferAttribute === true ) {

			const index = attribute.isStorageInstancedBufferAttribute === true ? instanceIndex : vertexIndex;

			return storage( attribute, type, Math.max( attribute.count, 1 ) ).onObjectUpdate( ( { object } ) => this.getAttribute( object ) ).element( index );

		}

		if ( type === 'mat4' ) {

			return mat4( ...[ 0, 4, 8, 12 ].map( ( offset ) => new ReferenceBufferAttributeNode( this, 'vec4', 16, offset ) ) );

		} else if ( type === 'mat3' ) {

			return mat3( ...[ 0, 3, 6 ].map( ( offset ) => new ReferenceBufferAttributeNode( this, 'vec3', 9, offset ) ) );

		}

		return new ReferenceBufferAttributeNode( this, type );

	}

}

export default ReferenceAttributeNode;

/**
 * TSL function for creating a reference attribute node.
 *
 * @tsl
 * @function
 * @param {string} name - The name of the property the node refers to.
 * @param {?string} [type=null] - The node type. Inferred from the attribute if not set.
 * @param {?Object} [object=null] - The object the property belongs to. The rendered object if not set.
 * @returns {ReferenceAttributeNode}
 */
export const referenceAttribute = ( name, type = null, object = null ) => new ReferenceAttributeNode( name, type, object );
