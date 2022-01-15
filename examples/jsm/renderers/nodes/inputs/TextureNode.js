import InputNode from '../core/InputNode.js';
import ExpressionNode from '../core/ExpressionNode.js';
import UVNode from '../accessors/UVNode.js';

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

			let snippet = nodeData.snippet;

			if ( snippet === undefined ) {

				const uvSnippet = this.uv.build( builder, 'vec2' );
				const bias = this.bias;

				let biasSnippet = null;

				if ( bias !== null ) {

					biasSnippet = bias.build( builder, 'float' );

				}

				snippet = builder.getTexture( textureProperty, uvSnippet, biasSnippet );

				nodeData.snippet = snippet;

			}

			return builder.format( snippet, 'vec4', output );

		}

	}

}

TextureNode.prototype.isTextureNode = true;

export default TextureNode;
