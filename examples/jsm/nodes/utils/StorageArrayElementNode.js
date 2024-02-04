import { addNodeClass } from '../core/Node.js';
import { nodeProxy, addNodeElement } from '../shadernode/ShaderNode.js';
import ArrayElementNode from './ArrayElementNode.js';

class StorageArrayElementNode extends ArrayElementNode {

	constructor( storageBufferNode, indexNode ) {

		super( storageBufferNode, indexNode );

		this.isStorageArrayElementNode = true;

	}

	set storageBufferNode( value ) {

		this.node = value;

	}

	get storageBufferNode() {

		return this.node;

	}

	generate( builder ) {

		let snippet;

		if ( builder.isAvailable( 'storageBuffer' ) === false ) {

			snippet = this.node.build( builder );

		} else {

			snippet = super.generate( builder );

		}

		return snippet;

	}

}

export default StorageArrayElementNode;

export const storageElement = nodeProxy( StorageArrayElementNode );

addNodeElement( 'storageElement', storageElement );

addNodeClass( 'StorageArrayElementNode', StorageArrayElementNode );
