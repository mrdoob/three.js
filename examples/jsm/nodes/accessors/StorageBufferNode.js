import BufferNode from './BufferNode.js';
import { bufferAttribute } from './BufferAttributeNode.js';
import { addNodeClass } from '../core/Node.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { varying } from '../core/VaryingNode.js';

class StorageBufferNode extends BufferNode {

	constructor( value, bufferType, bufferCount = 0, useExternalElements = false ) {

		super( value, bufferType, bufferCount );

		this.isStorageBufferNode = true;
		this.useExternalElements = useExternalElements;

		this._attribute = null;
		this._varying = null;

	}

	getInputType( /*builder*/ ) {

		return 'storageBuffer';

	}

	generate( builder ) {

		if ( builder.isAvailable( 'storageBuffer' ) ) return super.generate( builder );

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

export const storage = ( value, type, count, useExternalElements ) => nodeObject( new StorageBufferNode( value, type, count, useExternalElements ) );

addNodeClass( 'StorageBufferNode', StorageBufferNode );
