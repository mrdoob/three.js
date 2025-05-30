
import Node from './Node.js';
import { getByteBoundaryFromType, getMemoryLengthFromType } from './NodeUtils.js';

/**
 * Generates a layout for struct members.
 * This function takes an object representing struct members and returns an array of member layouts.
 * Each member layout includes the member's name, type, and whether it is atomic.
 *
 * @param {Object.<string, string|Object>} members - An object where keys are member names and values are either types (as strings) or objects with type and atomic properties.
 * @returns {Array.<{name: string, type: string, atomic: boolean}>} An array of member layouts.
 */
function getMembersLayout( members ) {

	return Object.entries( members ).map( ( [ name, value ] ) => {

		if ( typeof value === 'string' ) {

			return { name, type: value, atomic: false };

		}

		return { name, type: value.type, atomic: value.atomic || false };

	} );

}

/**
 * Represents a struct type node in the node-based system.
 * This class is used to define and manage the layout and types of struct members.
 * It extends the base Node class and provides methods to get the length of the struct,
 * retrieve member types, and generate the struct type for a builder.
 *
 * @augments Node
 */
class StructTypeNode extends Node {

	static get type() {

		return 'StructTypeNode';

	}

	/**
	 * Creates an instance of StructTypeNode.
	 *
	 * @param {Object} membersLayout - The layout of the members for the struct.
	 * @param {?string} [name=null] - The optional name of the struct.
	 */
	constructor( membersLayout, name = null ) {

		super( 'struct' );

		/**
		 * The layout of the members for the struct
		 *
		 * @type {Array.<{name: string, type: string, atomic: boolean}>}
		 */
		this.membersLayout = getMembersLayout( membersLayout );

		/**
		 * The name of the struct.
		 *
		 * @type {?string}
		 * @default null
		 */
		this.name = name;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isStructLayoutNode = true;

	}

	/**
	 * Returns the length of the struct.
	 * The length is calculated by summing the lengths of the struct's members.
	 *
	 * @returns {number} The length of the struct.
	 */
	getLength() {

		const GPU_CHUNK_BYTES = 8;
		const BYTES_PER_ELEMENT = Float32Array.BYTES_PER_ELEMENT;

		let offset = 0; // global buffer offset in bytes

		for ( const member of this.membersLayout ) {

			const type = member.type;

			const itemSize = getMemoryLengthFromType( type ) * BYTES_PER_ELEMENT;
			const boundary = getByteBoundaryFromType( type );

			const chunkOffset = offset % GPU_CHUNK_BYTES; // offset in the current chunk
			const chunkPadding = chunkOffset % boundary; // required padding to match boundary
			const chunkStart = chunkOffset + chunkPadding; // start position in the current chunk for the data

			offset += chunkPadding;

			// Check for chunk overflow
			if ( chunkStart !== 0 && ( GPU_CHUNK_BYTES - chunkStart ) < itemSize ) {

				// Add padding to the end of the chunk
				offset += ( GPU_CHUNK_BYTES - chunkStart );

			}

			offset += itemSize;

		}

		return ( Math.ceil( offset / GPU_CHUNK_BYTES ) * GPU_CHUNK_BYTES ) / BYTES_PER_ELEMENT;

	}

	getMemberType( builder, name ) {

		const member = this.membersLayout.find( m => m.name === name );

		return member ? member.type : 'void';

	}

	getNodeType( builder ) {

		const structType = builder.getStructTypeFromNode( this, this.membersLayout, this.name );

		return structType.name;

	}

	setup( builder ) {

		builder.addInclude( this );

	}

	generate( builder ) {

		return this.getNodeType( builder );

	}

}

export default StructTypeNode;
