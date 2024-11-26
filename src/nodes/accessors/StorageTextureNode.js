import TextureNode from './TextureNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { NodeAccess } from '../core/constants.js';

class StorageTextureNode extends TextureNode {

	static get type() {

		return 'StorageTextureNode';

	}

	constructor( value, uvNode, storeNode = null ) {

		super( value, uvNode );

		this.storeNode = storeNode;

		this.isStorageTextureNode = true;

		this.access = NodeAccess.WRITE_ONLY;

	}

	getInputType( /*builder*/ ) {

		return 'storageTexture';

	}

	setup( builder ) {

		super.setup( builder );

		const properties = builder.getNodeProperties( this );
		properties.storeNode = this.storeNode;

	}

	setAccess( value ) {

		this.access = value;
		return this;

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

	toReadWrite() {

		return this.setAccess( NodeAccess.READ_WRITE );

	}

	toReadOnly() {

		return this.setAccess( NodeAccess.READ_ONLY );

	}

	toWriteOnly() {

		return this.setAccess( NodeAccess.WRITE_ONLY );

	}

	generateStore( builder ) {

		const properties = builder.getNodeProperties( this );

		const { uvNode, storeNode } = properties;

		const textureProperty = super.generate( builder, 'property' );
		const uvSnippet = uvNode.build( builder, 'uvec2' );
		const storeSnippet = storeNode.build( builder, 'vec4' );

		const snippet = builder.generateTextureStore( builder, textureProperty, uvSnippet, storeSnippet );

		builder.addLineFlowCode( snippet, this );

	}

}

export default StorageTextureNode;

export const storageTexture = /*@__PURE__*/ nodeProxy( StorageTextureNode );

export const textureStore = ( value, uvNode, storeNode ) => {

	const node = storageTexture( value, uvNode, storeNode );

	if ( storeNode !== null ) node.append();

	return node;

};
