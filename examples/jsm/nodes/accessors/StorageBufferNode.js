import BufferNode from './BufferNode.js';
import { bufferAttribute } from './BufferAttributeNode.js';
import { addNodeClass } from '../core/Node.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { varying } from '../core/VaryingNode.js';
import { storageElement } from '../utils/StorageArrayElementNode.js';
import { GPUBufferBindingType } from '../../renderers/webgpu/utils/WebGPUConstants.js';

class StorageBufferNode extends BufferNode {

	constructor( value, bufferType, bufferCount = 0 ) {

		super( value, bufferType, bufferCount );

		this.isStorageBufferNode = true;

		this.access = GPUBufferBindingType.Storage;

		this.bufferObject = false;

		this._attribute = null;
		this._varying = null;

		if ( value.isStorageBufferAttribute !== true && value.isStorageInstancedBufferAttribute !== true ) {

			// TOOD: Improve it, possibly adding a new property to the BufferAttribute to identify it as a storage buffer read-only attribute in Renderer

			if ( value.isInstancedBufferAttribute ) value.isStorageInstancedBufferAttribute = true;
			else value.isStorageBufferAttribute = true;

		}

	}

	getInputType( /*builder*/ ) {

		return this.access === GPUBufferBindingType.Storage ? 'storageBuffer' : 'storageReadOnlyBuffer';

	}

	element( indexNode ) {

		return storageElement( this, indexNode );

	}

	setBufferObject( value ) {

		this.bufferObject = value;

		return this;

	}

	setAccess( value ) {

		this.access = value;

		return this;

	}

	generate( builder ) {

		if ( builder.isAvailable( 'storageBuffer' ) ) {

			return super.generate( builder );

		}

		const nodeType = this.getNodeType( builder );

		if ( this._attribute === null ) {

			this._attribute = bufferAttribute( this.value );
			this._varying = varying( this._attribute );

		}


		const output = this._varying.build( builder, nodeType );

		builder.registerTransform( output, this._attribute );

		return output;

	}

}

export default StorageBufferNode;

// Read-Write Storage
export const storage = ( value, type, count ) => nodeObject( new StorageBufferNode( value, type, count ) );
export const storageObject = ( value, type, count ) => nodeObject( new StorageBufferNode( value, type, count ).setBufferObject( true ) );

// Read-Only Storage
export const storageReadOnly = ( value, type, count ) => nodeObject( new StorageBufferNode( value, type, count ).setAccess( 'read-only-storage' ) );

addNodeClass( 'StorageBufferNode', StorageBufferNode );