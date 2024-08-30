import { registerNode } from '../core/Node.js';
import Node from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLBase.js';

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

		return builder.format( `${ builder.getMethod( 'textureDimensions' ) }( ${ textureProperty }, ${ levelNode } )`, this.getNodeType( builder ), output );

	}

}

export default TextureSizeNode;

TextureSizeNode.type = /*@__PURE__*/ registerNode( 'TextureSize', TextureSizeNode );

export const textureSize = /*@__PURE__*/ nodeProxy( TextureSizeNode );
