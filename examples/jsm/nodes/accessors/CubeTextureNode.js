import TextureNode from './TextureNode.js';
import UniformNode from '../core/UniformNode.js';
import ReflectNode from './ReflectNode.js';

class CubeTextureNode extends TextureNode {

	constructor( value, uvNode = null, levelNode = null ) {

		super( value, uvNode, levelNode );

	}

	getInputType( /*builder*/ ) {

		return 'cubeTexture';

	}

	generate( builder, output ) {

		const texture = this.value;
		const uvNode = this.uvNode || builder.context.uvNode || new ReflectNode();

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

			if ( builder.context.tempRead === false || snippet === undefined ) {

				const uvSnippet = uvNode.build( builder, 'vec3' );
				const levelNode = this.levelNode || builder.context.levelNode;

				if ( levelNode?.isNode === true ) {

					const levelOutNode = builder.context.levelShaderNode ? builder.context.levelShaderNode.call( { texture, levelNode }, builder ) : levelNode;

					const levelSnippet = levelOutNode.build( builder, 'float' );

					snippet = builder.getCubeTextureLevel( textureProperty, uvSnippet, levelSnippet );

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
