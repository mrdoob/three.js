import TextureNode from './TextureNode.js';
import UniformNode from '../core/UniformNode.js';
import ReflectNode from './ReflectNode.js';

class CubeTextureNode extends TextureNode {

	constructor( value, uvNode = new ReflectNode(), biasNode = null ) {

		super( value, uvNode, biasNode );

	}

	getInputType( /*builder*/ ) {

		return 'cubeTexture';

	}

	generate( builder, output ) {

		const texture = this.value;

		if ( ! texture || texture.isCubeTexture !== true ) {

			throw new Error( 'CubeTextureNode: Need a three.js cube texture.' );

		}

		const textureProperty = UniformNode.prototype.generate.call( this, builder, 'cubeTexture' );

		if ( output === 'sampler' ) {

			return textureProperty + '_sampler';

		} else if ( builder.isReference( output ) ) {

			return textureProperty;

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

}

CubeTextureNode.prototype.isCubeTextureNode = true;

export default CubeTextureNode;
