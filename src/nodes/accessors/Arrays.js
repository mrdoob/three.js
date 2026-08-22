import StorageInstancedBufferAttribute from '../../renderers/common/StorageInstancedBufferAttribute.js';
import StorageBufferAttribute from '../../renderers/common/StorageBufferAttribute.js';
import { storage } from './StorageBufferNode.js';
import { getLengthFromType, getTypedArrayFromType, isHalfType } from '../core/NodeUtils.js';

// Half-precision (fp16) storage-buffer arrays are backed by a raw Uint16Array of packed fp16
// bit patterns (see NodeUtils.getTypedArrayFromType()), not integer data - this flag tells
// WebGPUAttributeUtils.createAttribute() not to widen it to a Uint32Array the way a genuine
// Uint16 integer attribute would be (see that method's "patch for INT16 and UINT16"). It's the
// same duck-typed flag Float16BufferAttribute itself sets, just applied here to a storage
// attribute rather than a vertex attribute.
function tagHalfPrecision( buffer, type ) {

	if ( isHalfType( type ) ) buffer.isFloat16BufferAttribute = true;

	return buffer;

}

/**
 * TSL function for creating a storage buffer node with a configured `StorageBufferAttribute`.
 *
 * @tsl
 * @function
 * @param {number|TypedArray} count - The data count. It is also valid to pass a typed array as an argument.
 * @param {string|Struct} [type='float'] - The data type.
 * @returns {StorageBufferNode}
 */
export const attributeArray = ( count, type = 'float' ) => {

	let itemSize, typedArray;

	if ( type.isStructTypeNode === true ) {

		itemSize = type.getLength();
		typedArray = getTypedArrayFromType( 'float' );

	} else {

		itemSize = getLengthFromType( type );
		typedArray = getTypedArrayFromType( type );

	}

	const buffer = tagHalfPrecision( new StorageBufferAttribute( count, itemSize, typedArray ), type );
	const node = storage( buffer, type, count );

	return node;

};

/**
 * TSL function for creating a storage buffer node with a configured `StorageInstancedBufferAttribute`.
 *
 * @tsl
 * @function
 * @param {number|TypedArray} count - The data count. It is also valid to pass a typed array as an argument.
 * @param {string|Struct} [type='float'] - The data type.
 * @returns {StorageBufferNode}
 */
export const instancedArray = ( count, type = 'float' ) => {

	let itemSize, typedArray;

	if ( type.isStructTypeNode === true ) {

		itemSize = type.getLength();
		typedArray = getTypedArrayFromType( 'float' );

	} else {

		itemSize = getLengthFromType( type );
		typedArray = getTypedArrayFromType( type );

	}

	const buffer = tagHalfPrecision( new StorageInstancedBufferAttribute( count, itemSize, typedArray ), type );
	const node = storage( buffer, type, buffer.count );

	return node;

};
