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

			return builder.format( snippet, 'texture', output );

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
