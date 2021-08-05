import InputNode from '../core/InputNode.js';
import UVNode from '../accessors/UVNode.js';

class TextureNode extends InputNode {

	constructor( value = null, uv = new UVNode() ) {

		super( 'texture' );

		this.value = value;
		this.uv = uv;

	}

	generate( builder, output ) {

		const type = this.getType( builder );

		const textureProperty = super.generate( builder, type );
		const uvSnippet = this.uv.build( builder, 'vec2' );

		const textureCallSnippet = builder.getTexture( textureProperty, uvSnippet );

		return builder.format( textureCallSnippet, type, output );

	}

}

TextureNode.prototype.isTextureNode = true;

export default TextureNode;
