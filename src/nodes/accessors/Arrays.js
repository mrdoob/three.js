import StorageInstancedBufferAttribute from '../../renderers/common/StorageInstancedBufferAttribute.js';
import StorageBufferAttribute from '../../renderers/common/StorageBufferAttribute.js';
import { storage } from './StorageBufferNode.js';
import { getLengthFromType, getTypedArrayFromType } from '../core/NodeUtils.js';

/** @module Arrays **/

/**
 * TSL function for creating a storage buffer node with a configured `StorageBufferAttribute`.
 *
 * @function
 * @param {Number} count - The data count.
 * @param {String} [type='float'] - The data type.
 * @returns {StorageBufferNode}
 */
export const attributeArray = ( count, type = 'float' ) => {

	const itemSize = getLengthFromType( type );
	const typedArray = getTypedArrayFromType( type );

	const buffer = new StorageBufferAttribute( count, itemSize, typedArray );
	const node = storage( buffer, type, count );

	return node;

};

/**
 * TSL function for creating a storage buffer node with a configured `StorageInstancedBufferAttribute`.
 *
 * @function
 * @param {Number} count - The data count.
 * @param {String} [type='float'] - The data type.
 * @returns {StorageBufferNode}
 */
export const instancedArray = ( count, type = 'float' ) => {

	const itemSize = getLengthFromType( type );
	const typedArray = getTypedArrayFromType( type );

	const buffer = new StorageInstancedBufferAttribute( count, itemSize, typedArray );
	const node = storage( buffer, type, count );

	return node;

};
