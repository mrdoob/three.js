import UniformNode from '../core/UniformNode.js';
import ReflectNode from './ReflectNode.js';

class CubeTextureNode extends UniformNode {

	constructor( value, uvNode = new ReflectNode(), biasNode = null ) {

		super( value, 'vec4' );

		this.uvNode = uvNode;
		this.biasNode = biasNode;

	}

	getUniformHash( /*builder*/ ) {

		return this.value.uuid;

	}

	getInputType( /*builder*/ ) {

		return 'cubeTexture';

	}

	generate( builder, output ) {

		const texture = this.value;

		if ( ! texture || texture.isCubeTexture !== true ) {

			throw new Error( 'CubeTextureNode: Need a three.js cube texture.' );

		}

		const textureProperty = super.generate( builder, 'cubeTexture' );

		if ( output === 'samplerCube' || output === 'textureCube' ) {

			return textureProperty;

		} else if ( output === 'sampler' ) {

			return textureProperty + '_sampler';

		} else {

			const nodeData = builder.getDataFromNode( this );

			let snippet = nodeData.snippet;

			if ( snippet === undefined ) {

				const uvSnippet = this.uvNode.build( builder, 'vec3' );
				const biasNode = this.biasNode;

				if ( biasNode !== null ) {

					const biasSnippet = biasNode.build( builder, 'float' );

					snippet = builder.getCubeTextureBias( textureProperty, uvSnippet, biasSnippet );

				} else {

					snippet = builder.getCubeTexture( textureProperty, uvSnippet );

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

CubeTextureNode.prototype.isCubeTextureNode = true;

export default CubeTextureNode;
