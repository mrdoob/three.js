import Node from '../core/Node.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class TextureSizeNode extends Node {

	constructor( textureNode, levelNode = null ) {

		super( 'uvec2' );

		this.isTextureSizeNode = true;

		this.textureNode = textureNode;
		this.levelNode = levelNode;

	}

	generate( builder, output ) {

		const textureProperty = this.textureNode.build( builder, 'property' );
		const levelNode = this.levelNode.build( builder, 'int' );

		return builder.format( `${builder.getMethod( 'textureDimensions' )}( ${textureProperty}, ${levelNode} )`, this.getNodeType( builder ), output );

	}

}

export default TextureSizeNode;

export const textureSize = nodeProxy( TextureSizeNode );

addNodeElement( 'textureSize', textureSize );

addNodeClass( 'TextureSizeNode', TextureSizeNode );
