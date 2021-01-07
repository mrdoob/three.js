import InputNode from '../core/InputNode.js';
import UVNode from '../accessors/UVNode.js';

class TextureNode extends InputNode {

	constructor( value, uv = new UVNode() ) {

		super( 'texture' );

		this.value = value;
		this.uv = uv;

	}
	
	generate( builder, output ) {
	
		const textureSnippet = super.generate( builder );
		const uvSnippet = this.uv.build( builder );

		const textureCall = builder.getTexture( textureSnippet, uvSnippet );

		return builder.format( textureCall, 'vec4', output );
		
	}

}

export default TextureNode;
