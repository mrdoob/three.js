import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class TextureSizeNode extends TempNode {

	constructor( textureNode, levelNode = null ) {

		super( 'uvec2' );

		this.isTextureSizeNode = true;

		this.textureNode = textureNode;
		this.levelNode = levelNode;

	}

	generate( builder, output ) {

		const textureProperty = this.textureNode.texture.build( builder );
		const levelNode = this.levelNode.build( builder, 'int' );

		return builder.format( builder.formatOperation( '()', builder.getMethod( 'textureDimensions' ), [ textureProperty, levelNode ] ), this.getNodeType( builder ), output );

	}

}

export default TextureSizeNode;

export const textureSize = nodeProxy( TextureSizeNode );

addNodeElement( 'textureSize', textureSize );

addNodeClass( 'TextureSizeNode', TextureSizeNode );
