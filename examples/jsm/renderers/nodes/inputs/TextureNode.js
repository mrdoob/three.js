import InputNode from '../core/InputNode.js';
import UVNode from '../accessors/UVNode.js';

class TextureNode extends InputNode {

	constructor( value = null, uvNode = new UVNode(), biasNode = null ) {

		super( 'texture' );

		this.value = value;
		this.uvNode = uvNode;
		this.biasNode = biasNode;

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

				const uvSnippet = this.uvNode.build( builder, 'vec2' );
				const biasNode = this.biasNode;

				let biasSnippet = null;

				if ( biasNode !== null ) {

					biasSnippet = biasNode.build( builder, 'float' );

				}

				snippet = builder.getTexture( textureProperty, uvSnippet, biasSnippet );

				nodeData.snippet = snippet;

			}

			return builder.format( snippet, 'vec4', output );

		}

	}

	serialize( data ) {

		super.serialize( data );

		data.value = this.value.toJSON( data.meta ).uuid;

	}

	deserialize( data ) {

		super.serialize( data );

		this.value = data.meta.textures[ data.value ];

	}

}

TextureNode.prototype.isTextureNode = true;

export default TextureNode;
