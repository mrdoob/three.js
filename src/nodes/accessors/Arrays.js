import StorageInstancedBufferAttribute from '../../renderers/common/StorageInstancedBufferAttribute.js';
import StorageBufferAttribute from '../../renderers/common/StorageBufferAttribute.js';
import { storage } from './StorageBufferNode.js';
import { getLengthFromType } from '../core/NodeUtils.js';

export const attributeArray = ( count, type = 'float' ) => {

	const itemSize = getLengthFromType( type );

	const buffer = new StorageBufferAttribute( count, itemSize );
	const node = storage( buffer, type, count );

	return node;

};


export const instancedArray = ( count, type = 'float' ) => {

	const itemSize = getLengthFromType( type );

	const buffer = new StorageInstancedBufferAttribute( count, itemSize );
	const node = storage( buffer, type, count );

	return node;

};
