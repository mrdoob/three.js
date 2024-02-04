import { addNodeClass } from '../core/Node.js';
import { nodeProxy, addNodeElement } from '../shadernode/ShaderNode.js';
import ArrayElementNode from './ArrayElementNode.js';

class StorageArrayElementNode extends ArrayElementNode {

	constructor( storageBufferNode, indexNode ) {

		super( storageBufferNode, indexNode );

		this.isStorageArrayElementNode = true;

	}

	setup( builder ) {

		if ( this.node.isStorageBufferNode && ! builder.isAvailable( 'storageBuffer' ) ) {

			if ( ! this.node.instanceIndex ) {

				builder.setupPBONode( this.node );

			}


		}

		super.setup( builder );


	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );

		let snippet;

		if ( builder.isAvailable( 'storageBuffer' ) === false ) {

			const nodeSnippet = this.node.build( builder );
			const indexSnippet = this.indexNode.build( builder, 'uint' );

			snippet = nodeSnippet;

			// TODO: How to properly detect if the node will be used as an assign target?
			if ( ! this.node.instanceIndex && output !== 'assign' ) {

				snippet = builder.getPBOUniform( this.node, indexSnippet );

			}

			snippet = builder.format( snippet, type, output );

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
