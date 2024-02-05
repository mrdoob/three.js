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

	setup( builder ) {

		if ( builder.isAvailable( 'storageBuffer' ) === false ) {

			if ( ! this.node.instanceIndex ) {

				builder.setupPBO( this.node );

			}

		}

		super.setup( builder );

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );

		let snippet;

		if ( builder.isAvailable( 'storageBuffer' ) === false ) {

			const { node } = this;

			// TODO: How to properly detect if the node will be used as an assign target?
			if ( false && ! node.instanceIndex && builder.context.assign !== true ) {

				snippet = builder.generatePBO( this );

			} else {

				const nodeSnippet = node.build( builder );

				snippet = nodeSnippet;

			}

		} else {

			snippet = super.generate( builder );

		}

		return builder.format( snippet, type, output );

	}

}

export default StorageArrayElementNode;

export const storageElement = nodeProxy( StorageArrayElementNode );

addNodeElement( 'storageElement', storageElement );

addNodeClass( 'StorageArrayElementNode', StorageArrayElementNode );
