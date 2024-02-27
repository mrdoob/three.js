import { addNodeClass } from '../core/Node.js';
import TextureNode from './TextureNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';

class TextureStoreNode extends TextureNode {

	constructor( value, uvNode, storeNode = null ) {

		super( value, uvNode );

		this.storeNode = storeNode;

		this.isStoreTextureNode = true;

	}

	getInputType( /*builder*/ ) {

		return 'storageTexture';

	}

	setup( builder ) {

		super.setup( builder );

		const properties = builder.getNodeProperties( this );
		properties.storeNode = this.storeNode;

	}

	generate( builder, output ) {

		let snippet;

		if ( this.storeNode !== null ) {

			snippet = this.generateStore( builder );

		} else {

			snippet = super.generate( builder, output );

		}

		return snippet;

	}

	generateStore( builder ) {

		const properties = builder.getNodeProperties( this );

		const { uvNode, storeNode } = properties;

		const textureProperty = super.generate( builder, 'property' );
		const uvSnippet = uvNode.build( builder, 'uvec2' );
		const storeSnippet = storeNode.build( builder, 'vec4' );

		const snippet = builder.generateTextureStore( builder, textureProperty, uvSnippet, storeSnippet );

		builder.addLineFlowCode( snippet );

	}

}

export default TextureStoreNode;

const textureStoreBase = nodeProxy( TextureStoreNode );

export const textureStore = ( value, uvNode, storeNode ) => {

	const node = textureStoreBase( value, uvNode, storeNode );

	if ( storeNode !== null ) node.append();

	return node;

};

addNodeClass( 'TextureStoreNode', TextureStoreNode );
