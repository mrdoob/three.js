import InputNode from '../core/InputNode.js';
import ExpressionNode from '../core/ExpressionNode.js';
import UVNode from '../accessors/UVNode.js';
import ColorSpaceNode from '../display/ColorSpaceNode.js';

class TextureNode extends InputNode {

	constructor( value = null, uv = new UVNode(), bias = null ) {

		super( 'texture' );

		this.value = value;
		this.uv = uv;
		this.bias = bias;

	}

	generate( builder, output ) {

		const texture = this.value;

		if ( ! texture || texture.isTexture !== true ) {

			throw new Error( 'TextureNode: Need a three.js texture.' );

		}

		const type = this.getNodeType( builder );

		const textureProperty = super.generate( builder, type );

		if ( output === 'sampler2D' || output === 'texture2D' ) {

			return textureProperty;

		} else if ( output === 'sampler' ) {

			return textureProperty + '_sampler';

		} else {

			const nodeData = builder.getDataFromNode( this );

			let colorSpace = nodeData.colorSpace;

			if ( colorSpace === undefined ) {

				const uvSnippet = this.uv.build( builder, 'vec2' );
				const bias = this.bias;

				let biasSnippet = null;

				if ( bias !== null ) {

					biasSnippet = bias.build( builder, 'float' );

				}

				const textureCallSnippet = builder.getTexture( textureProperty, uvSnippet, biasSnippet );

				colorSpace = new ColorSpaceNode();
				colorSpace.node = new ExpressionNode( textureCallSnippet, 'vec4' );
				colorSpace.fromDecoding( builder.getTextureEncodingFromMap( texture ) );

				nodeData.colorSpace = colorSpace;

			}

			return colorSpace.build( builder, output );

		}

	}

}

TextureNode.prototype.isTextureNode = true;

export default TextureNode;
