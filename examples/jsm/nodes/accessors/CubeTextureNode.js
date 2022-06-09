import TextureNode from './TextureNode.js';
import UniformNode from '../core/UniformNode.js';
import ReflectNode from './ReflectNode.js';

class CubeTextureNode extends TextureNode {

	constructor( value, uvNode = null, levelNode = null ) {

		super( value, uvNode, levelNode );

		this.isCubeTextureNode = true;

	}

	getInputType( /*builder*/ ) {

		return 'cubeTexture';

	}

	getConstructHash( builder ) {

		return `${ this.uuid } / ${ builder.context.environmentContext?.uuid || '' }`;

	}

	construct( builder ) {

		const properties = builder.getNodeProperties( this );

		const uvNode = this.uvNode || builder.context.uvNode || new ReflectNode();
		let levelNode = this.levelNode || builder.context.levelNode;

		if ( levelNode?.isNode === true ) {

			const texture = this.value;

			levelNode = builder.context.levelShaderNode ? builder.context.levelShaderNode.call( { texture, levelNode }, builder ) : levelNode;

		}

		properties.uvNode = uvNode;
		properties.levelNode = levelNode;

	}

	generate( builder, output ) {

		const { uvNode, levelNode } = builder.getNodeProperties( this );

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

			if ( snippet === undefined || builder.context.tempRead === false ) {

				const uvSnippet = uvNode.build( builder, 'vec3' );

				if ( levelNode ) {

					const levelSnippet = levelNode.build( builder, 'float' );

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

export default CubeTextureNode;
