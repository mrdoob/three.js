import { addNodeClass } from '../core/Node.js';
import TextureNode from './TextureNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';

class TextureStoreNode extends TextureNode {

	constructor( value, uvNode, storeNode = null ) {

		super( value, uvNode );

		this.storeNode = storeNode;

		this.isStoreTextureNode = true;

	}

	getNodeType( /*builder*/ ) {

		return 'void';

	}

}

export default TextureStoreNode;

export const textureStore = nodeProxy( TextureStoreNode );

addNodeClass( TextureStoreNode );
