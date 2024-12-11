import BufferNode from './BufferNode.js';
import { bufferAttribute } from './BufferAttributeNode.js';
import { nodeObject, varying } from '../tsl/TSLBase.js';
import { storageElement } from '../utils/StorageArrayElementNode.js';
import { NodeAccess } from '../core/constants.js';
import { getTypeFromLength } from '../core/NodeUtils.js';

class StorageBufferNode extends BufferNode {

	static get type() {

		return 'StorageBufferNode';

	}

	constructor( value, bufferType = null, bufferCount = 0 ) {

		if ( bufferType === null && ( value.isStorageBufferAttribute || value.isStorageInstancedBufferAttribute ) ) {

			bufferType = getTypeFromLength( value.itemSize );
			bufferCount = value.count;

		}

		super( value, bufferType, bufferCount );

		this.isStorageBufferNode = true;

		this.access = NodeAccess.READ_WRITE;
		this.isAtomic = false;
		this.isPBO = false;

		this.bufferCount = bufferCount;

		this._attribute = null;
		this._varying = null;

		this.global = true;

		if ( value.isStorageBufferAttribute !== true && value.isStorageInstancedBufferAttribute !== true ) {

			// TOOD: Improve it, possibly adding a new property to the BufferAttribute to identify it as a storage buffer read-only attribute in Renderer

			if ( value.isInstancedBufferAttribute ) value.isStorageInstancedBufferAttribute = true;
			else value.isStorageBufferAttribute = true;

		}

	}

	getHash( builder ) {

		if ( this.bufferCount === 0 ) {

			let bufferData = builder.globalCache.getData( this.value );

			if ( bufferData === undefined ) {

				bufferData = {
					node: this
				};

				builder.globalCache.setData( this.value, bufferData );

			}

			return bufferData.node.uuid;

		}

		return this.uuid;

	}

	getInputType( /*builder*/ ) {

		return this.value.isIndirectStorageBufferAttribute ? 'indirectStorageBuffer' : 'storageBuffer';

	}

	element( indexNode ) {

		return storageElement( this, indexNode );

	}

	setPBO( value ) {

		this.isPBO = value;

		return this;

	}

	getPBO() {

		return this.isPBO;

	}

	setAccess( value ) {

		this.access = value;

		return this;

	}

	toReadOnly() {

		return this.setAccess( NodeAccess.READ_ONLY );

	}

	setAtomic( value ) {

		this.isAtomic = value;

		return this;

	}

	toAtomic() {

		return this.setAtomic( true );

	}

	getAttributeData() {

		if ( this._attribute === null ) {

			this._attribute = bufferAttribute( this.value );
			this._varying = varying( this._attribute );

		}

		return {
			attribute: this._attribute,
			varying: this._varying
		};

	}

	getNodeType( builder ) {

		if ( builder.isAvailable( 'storageBuffer' ) || builder.isAvailable( 'indirectStorageBuffer' ) ) {

			return super.getNodeType( builder );

		}

		const { attribute } = this.getAttributeData();

		return attribute.getNodeType( builder );

	}

	generate( builder ) {

		if ( builder.isAvailable( 'storageBuffer' ) || builder.isAvailable( 'indirectStorageBuffer' ) ) {

			return super.generate( builder );

		}

		const { attribute, varying } = this.getAttributeData();

		const output = varying.build( builder );

		builder.registerTransform( output, attribute );

		return output;

	}

}

export default StorageBufferNode;

export const storage = ( value, type, count ) => nodeObject( new StorageBufferNode( value, type, count ) );

export const storageObject = ( value, type, count ) => { // @deprecated, r171

	console.warn( 'THREE.TSL: "storageObject()" is deprecated. Use "storage().setPBO( true )" instead.' );

	return storage( value, type, count ).setPBO( true );

};
