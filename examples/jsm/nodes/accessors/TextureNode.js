import UniformNode from '../core/UniformNode.js';
import UVNode from './UVNode.js';

class TextureNode extends UniformNode {

	constructor( value, uvNode = new UVNode(), biasNode = null ) {

		super( value, 'vec4' );

		this.uvNode = uvNode;
		this.biasNode = biasNode;

	}

	getUniformHash( /*builder*/ ) {

		return this.value.uuid;

	}

	getInputType( /*builder*/ ) {

		return 'texture';

	}

	generate( builder, output ) {

		const texture = this.value;

		if ( ! texture || texture.isTexture !== true ) {

			throw new Error( 'TextureNode: Need a three.js texture.' );

		}

		const textureProperty = super.generate( builder, 'texture' );

		if ( output === 'sampler' ) {

			return textureProperty + '_sampler';

		} else if ( builder.isReference( output ) ) {

			return textureProperty;

		} else {

			const nodeData = builder.getDataFromNode( this );

			let snippet = nodeData.snippet;

			if ( snippet === undefined ) {

				const uvSnippet = this.uvNode.build( builder, 'vec2' );
				const biasNode = this.biasNode;

				if ( biasNode !== null ) {

					const biasSnippet = biasNode.build( builder, 'float' );

					snippet = builder.getTextureBias( textureProperty, uvSnippet, biasSnippet );

				} else {

					snippet = builder.getTexture( textureProperty, uvSnippet );

				}

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

		super.deserialize( data );

		this.value = data.meta.textures[ data.value ];

	}

}

TextureNode.prototype.isTextureNode = true;

export default TextureNode;
